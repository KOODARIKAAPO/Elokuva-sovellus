--
-- PostgreSQL database dump
--

\restrict vNRlTda8xZBcPlm6OXYP1JPJUKimAFaSto2ae90wNgfnoGHxoKvAwHFC0wJMuK9

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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
-- Name: account; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.account (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    hashedpassword character varying(255) NOT NULL,
    share_token character varying(64)
);


ALTER TABLE public.account OWNER TO netuser;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO netuser;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: booking; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.booking (
    id integer NOT NULL,
    user_id integer,
    tmdb_id integer NOT NULL,
    screening_date date NOT NULL,
    seats integer[] NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.booking OWNER TO netuser;

--
-- Name: booking_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_id_seq OWNER TO netuser;

--
-- Name: booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.booking_id_seq OWNED BY public.booking.id;


--
-- Name: favourite_list; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.favourite_list (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.favourite_list OWNER TO netuser;

--
-- Name: favourite_list_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.favourite_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favourite_list_id_seq OWNER TO netuser;

--
-- Name: favourite_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.favourite_list_id_seq OWNED BY public.favourite_list.id;


--
-- Name: favourite_list_item; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.favourite_list_item (
    list_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    "position" integer,
    added_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.favourite_list_item OWNER TO netuser;

--
-- Name: group_favourite; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.group_favourite (
    group_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_favourite OWNER TO netuser;

--
-- Name: group_list; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.group_list (
    id integer NOT NULL,
    group_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.group_list OWNER TO netuser;

--
-- Name: group_list_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.group_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_list_id_seq OWNER TO netuser;

--
-- Name: group_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.group_list_id_seq OWNED BY public.group_list.id;


--
-- Name: group_list_item; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.group_list_item (
    list_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    "position" integer,
    added_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_list_item OWNER TO netuser;

--
-- Name: group_member; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.group_member (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL
);


ALTER TABLE public.group_member OWNER TO netuser;

--
-- Name: group_message; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.group_message (
    id integer NOT NULL,
    group_id integer NOT NULL,
    sender_id integer NOT NULL,
    message_text text NOT NULL,
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_message OWNER TO netuser;

--
-- Name: group_message_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.group_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_message_id_seq OWNER TO netuser;

--
-- Name: group_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.group_message_id_seq OWNED BY public.group_message.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    owner_id integer NOT NULL,
    password character varying(255)
);


ALTER TABLE public.groups OWNER TO netuser;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO netuser;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.review (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    rating integer NOT NULL,
    review_text character varying(2000),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT review_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.review OWNER TO netuser;

--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: netuser
--

CREATE SEQUENCE public.review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_id_seq OWNER TO netuser;

--
-- Name: review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: netuser
--

ALTER SEQUENCE public.review_id_seq OWNED BY public.review.id;


--
-- Name: user_favourite; Type: TABLE; Schema: public; Owner: netuser
--

CREATE TABLE public.user_favourite (
    user_id integer NOT NULL,
    tmdb_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_favourite OWNER TO netuser;

--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: booking id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.booking ALTER COLUMN id SET DEFAULT nextval('public.booking_id_seq'::regclass);


--
-- Name: favourite_list id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list ALTER COLUMN id SET DEFAULT nextval('public.favourite_list_id_seq'::regclass);


--
-- Name: group_list id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list ALTER COLUMN id SET DEFAULT nextval('public.group_list_id_seq'::regclass);


--
-- Name: group_message id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_message ALTER COLUMN id SET DEFAULT nextval('public.group_message_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: review id; Type: DEFAULT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.review ALTER COLUMN id SET DEFAULT nextval('public.review_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.account (id, username, email, hashedpassword, share_token) FROM stdin;
2	Kaapo2	k@k.fiu	138fad05994e357720ba8feafbef5e1a:be404fc53f996011b4da86cead5b855f830c01ab167c081fb7e6cf9bb223bcdf96b3b07581fb2760b458dbe4be7b54e1a28097a1a5758b5cec7a350971c5978a	\N
3	test1	t@t	db6d9065419f7b03a4a6bfc6e61c076e:8e03e222b0e9d1393c90b1a0bf081ca3f7e99e70f6a6e754675c389a5ba4433e1d0e19d1390445dc7beb069ef5c90196f1fc296aee01dfbe878423766965ec99	\N
4	tiitus	t@t.fi	9861205764fc68d0cca57e112bd3c85b:f645c9aab09c50b58403827000b4d631db26f83555a9efa8b0e7cee6ec00ba2c0e7bd2c5460d123c1d3d7e413b55d733247575fb07b420b6df9cf27b0aeb6996	\N
1	kaapo	k@k.fi	e4c2ba4a252b07492b597237bdd8f447:f4d1a15291583881632fd5f7075c5f54289be2199674c835612240ae07407c56d61902b7fce59a641428c8dc69c22cc4008dc1f689381d13a6bd50c1f6cff7c1	ebf2e3c0d6999aa911e4a4bed304a04ccf41c0512f63e8cf
5	Marko	m.m@m.fi	e95cbb4d67d7de08b24a88d760e87d3e:4ef33874a03f53868c2e21d0cad9708e424c73bfb01d8bf26f9f3ae330c08a9c7bc14876e80d0007878c968c035edd6fcf730b0661543c1a69c4b4a36abde40c	\N
6	Jergon	j.j@j	00b209b1bfce449d8ef7b95d4161245f:19b2581eb2fafbe7c835bc481a5873fee32a81e6ff126de236271029dc6d9be1a28992a455dead3ea06407632e219f5fe3b4ead5b52723132e37d8a3c98bca6d	\N
\.


--
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.booking (id, user_id, tmdb_id, screening_date, seats, created_at) FROM stdin;
\.


--
-- Data for Name: favourite_list; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.favourite_list (id, user_id, name) FROM stdin;
\.


--
-- Data for Name: favourite_list_item; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.favourite_list_item (list_id, tmdb_id, "position", added_at) FROM stdin;
\.


--
-- Data for Name: group_favourite; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.group_favourite (group_id, tmdb_id, created_at) FROM stdin;
2	802	2025-12-10 09:47:25.304474
\.


--
-- Data for Name: group_list; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.group_list (id, group_id, name) FROM stdin;
\.


--
-- Data for Name: group_list_item; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.group_list_item (list_id, tmdb_id, "position", added_at) FROM stdin;
\.


--
-- Data for Name: group_member; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.group_member (group_id, user_id, role, status) FROM stdin;
1	3	member	approved
1	4	member	approved
1	5	member	approved
\.


--
-- Data for Name: group_message; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.group_message (id, group_id, sender_id, message_text, sent_at) FROM stdin;
1	1	1	Moro	2025-12-08 10:05:09.185373
3	1	4	moro	2025-12-09 14:16:51.964957
4	1	1	Tässä on list hyviä leffoja http://localhost:3002/shared/ebf2e3c0d6999aa911e4a4bed304a04ccf41c0512f63e8cf	2025-12-09 14:19:19.320698
5	1	4	Kappas	2025-12-09 14:20:09.852612
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.groups (id, name, owner_id, password) FROM stdin;
1	Hemulit	1	\N
2	PedoBearit	6	\N
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.review (id, user_id, tmdb_id, rating, review_text, created_at) FROM stdin;
1	1	176	5	Pirun hyvä\n	2025-12-09 14:18:34.416218
2	6	802	4	Piru että on hyvä leffa	2025-12-10 09:47:54.138058
\.


--
-- Data for Name: user_favourite; Type: TABLE DATA; Schema: public; Owner: netuser
--

COPY public.user_favourite (user_id, tmdb_id, created_at) FROM stdin;
1	510	2025-12-08 10:04:31.17644
1	701387	2025-12-09 14:17:34.854193
1	176	2025-12-09 14:18:23.305889
5	1180831	2025-12-10 09:22:33.668004
5	1246049	2025-12-10 09:22:42.55763
6	62	2025-12-10 09:44:08.218284
6	18875	2025-12-10 09:44:20.415385
6	345	2025-12-10 09:44:24.615188
6	600	2025-12-10 09:44:27.814301
6	802	2025-12-10 09:47:58.534453
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.account_id_seq', 6, true);


--
-- Name: booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.booking_id_seq', 1, false);


--
-- Name: favourite_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.favourite_list_id_seq', 1, false);


--
-- Name: group_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.group_list_id_seq', 1, false);


--
-- Name: group_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.group_message_id_seq', 5, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.groups_id_seq', 2, true);


--
-- Name: review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: netuser
--

SELECT pg_catalog.setval('public.review_id_seq', 2, true);


--
-- Name: account account_email_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_share_token_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_share_token_key UNIQUE (share_token);


--
-- Name: account account_username_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (id);


--
-- Name: favourite_list_item favourite_list_item_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list_item
    ADD CONSTRAINT favourite_list_item_pkey PRIMARY KEY (list_id, tmdb_id);


--
-- Name: favourite_list favourite_list_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_pkey PRIMARY KEY (id);


--
-- Name: favourite_list favourite_list_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_user_id_name_key UNIQUE (user_id, name);


--
-- Name: group_favourite group_favourite_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_favourite
    ADD CONSTRAINT group_favourite_pkey PRIMARY KEY (group_id, tmdb_id);


--
-- Name: group_list group_list_group_id_name_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_group_id_name_key UNIQUE (group_id, name);


--
-- Name: group_list_item group_list_item_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list_item
    ADD CONSTRAINT group_list_item_pkey PRIMARY KEY (list_id, tmdb_id);


--
-- Name: group_list group_list_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_pkey PRIMARY KEY (id);


--
-- Name: group_member group_member_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: group_message group_message_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: review review_user_id_tmdb_id_key; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_user_id_tmdb_id_key UNIQUE (user_id, tmdb_id);


--
-- Name: user_favourite user_favourite_pkey; Type: CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.user_favourite
    ADD CONSTRAINT user_favourite_pkey PRIMARY KEY (user_id, tmdb_id);


--
-- Name: booking booking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: favourite_list_item favourite_list_item_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list_item
    ADD CONSTRAINT favourite_list_item_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.favourite_list(id) ON DELETE CASCADE;


--
-- Name: favourite_list favourite_list_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.favourite_list
    ADD CONSTRAINT favourite_list_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: group_favourite group_favourite_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_favourite
    ADD CONSTRAINT group_favourite_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_list group_list_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list
    ADD CONSTRAINT group_list_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_list_item group_list_item_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_list_item
    ADD CONSTRAINT group_list_item_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.group_list(id) ON DELETE CASCADE;


--
-- Name: group_member group_member_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_member group_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: group_message group_message_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_message group_message_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.group_message
    ADD CONSTRAINT group_message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: groups groups_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: review review_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: user_favourite user_favourite_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: netuser
--

ALTER TABLE ONLY public.user_favourite
    ADD CONSTRAINT user_favourite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vNRlTda8xZBcPlm6OXYP1JPJUKimAFaSto2ae90wNgfnoGHxoKvAwHFC0wJMuK9

