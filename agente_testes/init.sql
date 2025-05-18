CREATE TABLE public.users (
	id text NOT NULL,
	"name" text NOT NULL,
	email text NOT NULL,
	created_at text NOT NULL,
	CONSTRAINT unique_email UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.conversations (
	id text NOT NULL,
	id_user text NOT NULL,
	title text NOT NULL,
	created_at text NOT NULL,
	updated_at text NOT NULL,
	CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

-- public.conversations foreign keys

ALTER TABLE public.conversations ADD CONSTRAINT conversations_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.users(id);

CREATE TABLE public.messages (
	id text NOT NULL,
	id_conversation text NOT NULL,
	id_parental text NOT NULL,
	"role" text NOT NULL,
	"content" text NULL,
	"timestamp" text NOT NULL,
	CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- public.messages foreign keys

ALTER TABLE public.messages ADD CONSTRAINT messages_id_conversation_fkey FOREIGN KEY (id_conversation) REFERENCES public.conversations(id);

