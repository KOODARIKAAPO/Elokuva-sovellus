--
-- PostgreSQL database dump
--

\restrict tgKp5r1YfveYN9Vd0v3oegMjm0D0UY7432A4mBmy9802S6bIl0baXbeXlRcd2h2

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: favourite_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourite_list (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.favourite_list OWNER TO postgres;

--
-- Name: favourite_list_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favourite_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favourite_list_id_seq OWNER TO postgres;

--
-- Name: favourite_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favourite_list_id_seq OWNED BY public.favourite_list.id;


--
-- Name: favourite_list_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourite_list_item (
    list_id integer NOT NULL,
    movie_id integer NOT NULL,
    "position" integer,
    added_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.favourite_list_item OWNER TO postgres;

--
-- Name: group_favourite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_favourite (
    group_id integer NOT NULL,
    movie_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_favourite OWNER TO postgres;

--
-- Name: group_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_list (
    id integer NOT NULL,
    group_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.group_list OWNER TO postgres;

--
-- Name: group_list_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_list_id_seq OWNER TO postgres;

--
-- Name: group_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_list_id_seq OWNED BY public.group_list.id;


--
-- Name: group_list_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_list_item (
    list_id integer NOT NULL,
    movie_id integer NOT NULL,
    "position" integer,
    added_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_list_item OWNER TO postgres;

--
-- Name: group_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_member (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying
);


ALTER TABLE public.group_member OWNER TO postgres;

--
-- Name: group_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_message (
    id integer NOT NULL,
    group_id integer NOT NULL,
    sender_id integer NOT NULL,
    message_text text NOT NULL,
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_message OWNER TO postgres;

--
-- Name: group_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_message_id_seq OWNER TO postgres;

--
-- Name: group_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_message_id_seq OWNED BY public.group_message.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    owner_id integer NOT NULL,
    password character varying(255)
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: movie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    director character varying(255),
    year integer,
    genre character varying(100)
);


ALTER TABLE public.movie OWNER TO postgres;

--
-- Name: movie_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movie_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movie_id_seq OWNER TO postgres;

--
-- Name: movie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movie_id_seq OWNED BY public.movie.id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    id integer NOT NULL,
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    rating integer NOT NULL,
    review_text character varying(2000),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT review_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.review OWNER TO postgres;

--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_id_seq OWNER TO postgres;

--
-- Name: review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_id_seq OWNED BY public.review.id;


--
-- Name: user_favourite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favourite (
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_favourite OWNER TO postgres;

--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: favourite_list id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list ALTER COLUMN id SET DEFAULT nextval('public.favourite_list_id_seq'::regclass);


--
-- Name: group_list id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list ALTER COLUMN id SET DEFAULT nextval('public.group_list_id_seq'::regclass);


--
-- Name: group_message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_message ALTER COLUMN id SET DEFAULT nextval('public.group_message_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: movie id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie ALTER COLUMN id SET DEFAULT nextval('public.movie_id_seq'::regclass);


--
-- Name: review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review ALTER COLUMN id SET DEFAULT nextval('public.review_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, username, email, password) FROM stdin;
1	kaapo	kaapo@example.com	salasana123
\.


--
-- Data for Name: favourite_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourite_list (id, user_id, name) FROM stdin;
\.


--
-- Data for Name: favourite_list_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourite_list_item (list_id, movie_id, "position", added_at) FROM stdin;
\.


--
-- Data for Name: group_favourite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_favourite (group_id, movie_id, created_at) FROM stdin;
\.


--
-- Data for Name: group_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_list (id, group_id, name) FROM stdin;
\.


--
-- Data for Name: group_list_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_list_item (list_id, movie_id, "position", added_at) FROM stdin;
\.


--
-- Data for Name: group_member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_member (group_id, user_id, role) FROM stdin;
\.


--
-- Data for Name: group_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_message (id, group_id, sender_id, message_text, sent_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, owner_id, password) FROM stdin;
\.


--
-- Data for Name: movie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie (id, title, director, year, genre) FROM stdin;
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review (id, user_id, movie_id, rating, review_text, created_at) FROM stdin;
\.


--
-- Data for Name: user_favourite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favourite (user_id, movie_id, created_at) FROM stdin;
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 1, true);


--
-- Name: favourite_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favourite_list_id_seq', 1, false);


--
-- Name: group_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_list_id_seq', 1, false);


--
-- Name: group_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_message_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: movie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movie_id_seq', 1, false);


--
-- Name: review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_id_seq', 1, false);


--
-- Name: account account_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);


--
-- Name: favourite_list_item favourite_list_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list_item
    ADD CONSTRAINT favourite_list_item_pkey PRIMARY KEY (list_id, movie_id);


--
-- Name: favourite_list favourite_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_pkey PRIMARY KEY (id);


--
-- Name: favourite_list favourite_list_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_user_id_name_key UNIQUE (user_id, name);


--
-- Name: group_favourite group_favourite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_favourite
    ADD CONSTRAINT group_favourite_pkey PRIMARY KEY (group_id, movie_id);


--
-- Name: group_list group_list_group_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_group_id_name_key UNIQUE (group_id, name);


--
-- Name: group_list_item group_list_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list_item
    ADD CONSTRAINT group_list_item_pkey PRIMARY KEY (list_id, movie_id);


--
-- Name: group_list group_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_pkey PRIMARY KEY (id);


--
-- Name: group_member group_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: group_message group_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: movie movie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie
    ADD CONSTRAINT movie_pkey PRIMARY KEY (id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: review review_user_id_movie_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_user_id_movie_id_key UNIQUE (user_id, movie_id);


--
-- Name: user_favourite user_favourite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favourite
    ADD CONSTRAINT user_favourite_pkey PRIMARY KEY (user_id, movie_id);


--
-- Name: favourite_list_item favourite_list_item_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list_item
    ADD CONSTRAINT favourite_list_item_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.favourite_list(id) ON DELETE CASCADE;


--
-- Name: favourite_list_item favourite_list_item_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list_item
    ADD CONSTRAINT favourite_list_item_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(id) ON DELETE CASCADE;


--
-- Name: favourite_list favourite_list_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: group_favourite group_favourite_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_favourite
    ADD CONSTRAINT group_favourite_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_favourite group_favourite_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_favourite
    ADD CONSTRAINT group_favourite_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(id) ON DELETE CASCADE;


--
-- Name: group_list group_list_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_list_item group_list_item_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list_item
    ADD CONSTRAINT group_list_item_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.group_list(id) ON DELETE CASCADE;


--
-- Name: group_list_item group_list_item_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_list_item
    ADD CONSTRAINT group_list_item_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(id) ON DELETE CASCADE;


--
-- Name: group_member group_member_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_member group_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: group_message group_message_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_message group_message_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: groups groups_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: review review_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(id) ON DELETE CASCADE;


--
-- Name: review review_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: user_favourite user_favourite_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favourite
    ADD CONSTRAINT user_favourite_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(id) ON DELETE CASCADE;


--
-- Name: user_favourite user_favourite_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favourite
    ADD CONSTRAINT user_favourite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tgKp5r1YfveYN9Vd0v3oegMjm0D0UY7432A4mBmy9802S6bIl0baXbeXlRcd2h2

