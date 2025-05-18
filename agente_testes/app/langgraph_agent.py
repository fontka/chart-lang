from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.graph.state import CompiledStateGraph
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from typing import Literal, AsyncGenerator
from datetime import datetime
import json
from contextlib import asynccontextmanager
import asyncpg

load_dotenv()

POSTGRES_URL = "postgresql://postgres:postgres@postgres:5432/postgres"

@asynccontextmanager
async def open_db():
    conn = await asyncpg.connect(POSTGRES_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Schemas

class ConversationSummary(BaseModel):
    id_conversation: str
    title: str
    updated_at: str

class Message(BaseModel):
    id_mensagem: str
    id_parental: str
    role: str
    content: str
    timestamp: str

class NewUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: str

class NewMessage(BaseModel):
    id_parent: str = ''
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: str

class LLMResponse(BaseModel):
    id: str
    id_parent: str
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: str

# LangGraph

llm = ChatOpenAI(model='gpt-4.1-nano', temperature=.5, max_completion_tokens=500)

def node(state : MessagesState) -> MessagesState:
    return {'messages': llm.invoke(state['messages'])}

def create_agent_graph() -> CompiledStateGraph:
    builder = StateGraph(MessagesState).add_node('node', node).add_edge(START, 'node').add_edge('node', END)
    return builder.compile()

async def chat_with_llm(id_user : str, id_conversation : str, msg : NewMessage, graph : CompiledStateGraph) -> AsyncGenerator:
    
    async with open_db() as db:
        dados = await db.fetchrow("SELECT 1 FROM messages WHERE id_conversation = $1",id_conversation)

        if dados:
            new_conversation = False
        else:
            new_conversation = True

        if new_conversation:
            user_input = [msg.content]
        else:
            dados = await db.fetch("""SELECT * FROM messages WHERE id_conversation = $1""",id_conversation)
            user_input = []

            for r in dados:
                if str(r['role']) == 'user':
                    user_input.append(HumanMessage(r['content'], id=r['id']))
                elif str(r['role']) == 'assistant':
                    user_input.append(AIMessage(r['content'], id=r['id']))

            user_input = user_input[-6:]
            last_id = user_input[-1].id
            user_input.append(HumanMessage(msg.content))

        async for event in graph.astream_events({'messages':user_input}, version='v2'):
            if(event['event'] == 'on_chat_model_stream'):
                ai_chunk = event['data']['chunk'].content
                yield ai_chunk

            elif(event['event'] == 'on_chain_end' and isinstance(event['data']['output']['messages'], list)):
                output_messages = event['data']['output']['messages']
                human_message = output_messages[-2]
                ai_message = output_messages[-1]

                id_human_message = human_message.id
                id_ai_message = str(ai_message.id).replace('run--','')

        if new_conversation:
            timestamp_now = datetime.now().astimezone().isoformat()
            title = (await graph.ainvoke({'messages':f'Crie um título generalista para o seguinte tópico com no máximo 5 palavras: <user_msg>{user_input}</user_msg>'}))['messages'][-1].content
            
            await db.execute("""INSERT INTO conversations 
                            (id, id_user, title, created_at, updated_at)
                            VALUES ($1,$2,$3,$4,$5)""",id_conversation,id_user,title,timestamp_now,timestamp_now)
            
            await db.execute("""INSERT INTO messages
                            (id, id_parental, id_conversation, role, content, timestamp) 
                            VALUES ($1,$2,$3,$4,$5,$6)
                            """,id_human_message,"",id_conversation,'user',human_message.content, msg.timestamp)
            
            await db.execute("""INSERT INTO messages
                            (id, id_parental, id_conversation, role, content, timestamp) 
                            VALUES ($1,$2,$3,$4,$5,$6)
                            """,id_ai_message,id_human_message,id_conversation,'assistant',ai_message.content, timestamp_now)
            
        else:
            timestamp_now = datetime.now().astimezone().isoformat()

            await db.execute("""UPDATE conversations SET updated_at = $1 WHERE id = $2""",timestamp_now, id_conversation)
            
            await db.execute("""INSERT INTO messages
                            (id, id_parental, id_conversation, role, content, timestamp) 
                            VALUES ($1,$2,$3,$4,$5,$6)
                            """,id_human_message,last_id,id_conversation,'user',human_message.content, msg.timestamp)
            
            await db.execute("""INSERT INTO messages
                            (id, id_parental, id_conversation, role, content, timestamp) 
                            VALUES ($1,$2,$3,$4,$5,$6)
                            """,id_ai_message,id_human_message,id_conversation,'assistant',ai_message.content, timestamp_now)
            

        yield "\n<end>\n" + json.dumps({"id":id_ai_message,
                                        "id_parental":id_human_message, 
                                        "role":'assistant', 
                                        "content":ai_message.content, 
                                        "timestamp":timestamp_now})



