from fastapi import FastAPI, Path, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Optional, Literal
from langgraph_agent import *
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints

@app.get("/users/{id_user}/conversations/", status_code=200, response_model=List[ConversationSummary], summary="Retorna o histórico de conversas")
async def get_user_conversations(id_user: str = Path(...)):
    try:
        async with open_db() as db:
            dados = await db.fetch("""SELECT * FROM conversations WHERE id_user = $1 ORDER BY updated_at DESC""",id_user)
            list_json = []
            for r in dados:
                list_json.append({'id_conversation':r['id'],'title':r['title'], 'updated_at':r['updated_at']})
            
            if len(list_json) == 0:
                dados = await db.fetch("""SELECT * FROM users WHERE id = $1""",id_user)
                if len(dados) > 0:
                    raise Exception('ID de conversa não existente')
                raise Exception('ID de usuário não existente')
                
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= str(ex)
            ) 
    return list_json

@app.get("/conversations/{id_conversation}", status_code=200, response_model=List[Message], summary="Listar mensagens de uma conversa")
async def get_conversation_messages(id_conversation: str = Path(...)):
    try:
        async with open_db() as db:
            dados = await db.fetch("""SELECT * FROM messages WHERE id_conversation = $1""",id_conversation)
            list_json = []

            for r in dados:
                list_json.append({"id_mensagem":r['id'],"id_parental": r['id_parental'] ,"role": r['role'], 'content':r['content'], 'timestamp': r['timestamp']})
            
            if len(list_json) == 0:
                raise Exception('ID de conversa não existente.')
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= str(ex)
            )   
    return list_json

@app.delete("/users/{id_user}/conversations/{id_conversation}", status_code=204, summary="Excluir uma conversa de um usuário")
async def delete_user_conversation(
    id_user: str = Path(...),
    id_conversation: str = Path(...)
):
    try:
        async with open_db() as db:
            dados = await db.fetchrow("""SELECT 1 FROM conversations WHERE id = $1 AND id_user = $2""",id_conversation,id_user)

            if not dados:
                raise Exception('Não há registros com esse id de conversa')
            
            await db.execute("""DELETE FROM messages WHERE id_conversation = $1""",id_conversation)
            await db.execute("""DELETE FROM conversations WHERE id = $1 AND id_user = $2""",id_conversation, id_user)

    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= str(ex)
        )
    return {"detail": "Conversa excluída com sucesso"}

@app.post("/user", status_code=201, summary='Criação de usuário')
async def create_user(user: NewUser):
    try:
        async with open_db() as db:
            await db.execute("""INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, $4);""",user.id, user.name, user.email, user.created_at)
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= str(ex)
        )
    return {"detail": "Usuário criado com sucesso"}

@app.post("/users/{id_user}/conversations/{id_conversation}/messages", response_model=LLMResponse, summary="Enviar mensagem em uma conversa")
async def send_message(
    id_user: str = Path(...),
    id_conversation: str = Path(...),
    msg: NewMessage = ...
):
    async with open_db() as db:
        resultado_user = await db.fetchrow("""SELECT 1 FROM users WHERE id = $1""",id_user)

        if resultado_user is not None:
            return StreamingResponse(chat_with_llm(id_user, id_conversation, msg, create_agent_graph()), media_type='text/plain')

        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail= str('Id de usuário não encontrado')
        )  