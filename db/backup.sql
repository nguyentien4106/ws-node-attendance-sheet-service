--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4

-- Started on 2024-10-14 17:17:18 UTC

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
-- TOC entry 217 (class 1259 OID 33299)
-- Name: Attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attendances" (
    "Id" integer NOT NULL,
    "DeviceId" integer NOT NULL,
    "VerifyDate" timestamp with time zone NOT NULL,
    "DeviceName" text,
    "UserName" text,
    "UserId" text,
    "Name" text
);


ALTER TABLE public."Attendances" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 33298)
-- Name: Attendances_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Attendances" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Attendances_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 33305)
-- Name: Devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Devices" (
    "Id" integer NOT NULL,
    "Ip" text NOT NULL,
    "Port" text NOT NULL,
    "CommKey" text NOT NULL,
    "IsConnected" boolean NOT NULL,
    "Name" text
);


ALTER TABLE public."Devices" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33304)
-- Name: Devices_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Devices" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Devices_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 33313)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "Password" text NOT NULL,
    "Role" integer NOT NULL,
    "CardNo" text NOT NULL,
    "DisplayName" name COLLATE pg_catalog."default",
    "DeviceIp" text,
    "UID" integer,
    "UserId" text
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33312)
-- Name: Employees_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Users" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Employees_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 33329)
-- Name: Sheets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sheets" (
    "Id" integer NOT NULL,
    "DeviceId" integer NOT NULL,
    "SheetName" text NOT NULL,
    "DocumentId" text NOT NULL
);


ALTER TABLE public."Sheets" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33328)
-- Name: Sheets_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Sheets" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Sheets_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 215 (class 1259 OID 33293)
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- TOC entry 3379 (class 0 OID 33299)
-- Dependencies: 217
-- Data for Name: Attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public."Attendances" ("Id", "DeviceId", "VerifyDate", "DeviceName", "UserName", "UserId", "Name") FROM stdin;
-- 7	30	2000-02-02 00:00:00+00	Cổng 4	Tien	1000	\N
-- 8	30	2024-10-12 10:28:09.827247+00	Cổng 4	Tien	1000	\N
-- 9	30	2024-10-12 10:28:55.775304+00	Cổng 4	Tien	1000	\N
-- 10	30	2024-10-12 10:40:30.585886+00	Cổng 4	Tien	1000	\N
-- 11	30	2024-10-12 10:41:21.12774+00	Cổng 4	Tien	1000	\N
-- 12	30	2024-10-12 10:45:52.701304+00	Cổng 4	Tien	1000	\N
-- 13	30	2024-10-12 10:47:39.005214+00	Cổng 4	Tiến	1000	\N
-- 14	32	2024-10-12 11:11:11.609906+00	Cổng phụ 1	88	1	\N
-- 15	35	2024-10-13 13:01:58.322475+00	Cổng 3	88	1	\N
-- 16	35	2024-10-13 13:09:20.549841+00	Cổng 3	88	1	\N
-- 17	35	2024-10-13 13:12:16.783709+00	Cổng 3	88	1	\N
-- 18	35	2024-10-13 13:13:42.000344+00	Cổng 3	88	1	\N
-- 19	35	2024-10-13 13:13:47.618769+00	Cổng 3	Nguyễn Văn Tiến	123456	nguyenvantien\n
-- 20	36	2024-10-13 13:13:47.618769+00	Cổng 3	Nguyễn Văn Tiến	123456	nguyenvantien
-- 21	35	2024-10-13 13:13:48.823877+00	Cổng 3	Nguyễn Văn Tiến	123456	nguyenvantien
-- 22	36	2024-10-13 13:13:48.823877+00	Cổng 3	Nguyễn Văn Tiến	123456	nguyenvantien
-- 71	-1	2024-10-12 16:50:35+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 72	-1	2024-10-12 16:50:36+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 73	-1	2024-10-12 16:53:34+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 74	-1	2024-10-12 17:25:15+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 75	-1	2024-10-12 18:09:37+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 76	-1	2024-10-13 20:00:17+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 77	-1	2024-10-13 20:07:40+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 78	-1	2024-10-13 20:10:36+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 79	-1	2024-10-13 20:12:01+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 80	-1	2024-10-13 20:12:07+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- 81	-1	2024-10-13 20:12:08+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- 82	-1	2024-10-14 00:05:47+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- 83	-1	2024-10-12 16:50:35+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 84	-1	2024-10-12 16:50:36+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 85	-1	2024-10-12 16:53:34+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 86	-1	2024-10-12 17:25:15+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 87	-1	2024-10-12 18:09:37+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 88	-1	2024-10-13 20:00:17+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 89	-1	2024-10-13 20:07:40+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 90	-1	2024-10-13 20:10:36+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 91	-1	2024-10-13 20:12:01+00	DeviceName: 192.168.1.201	UserName: 1	1	Name: 1
-- 92	-1	2024-10-13 20:12:07+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- 93	-1	2024-10-13 20:12:08+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- 94	-1	2024-10-14 00:05:47+00	DeviceName: 192.168.1.201	nguyenvantien	123456	nguyenvantien
-- \.


--
-- TOC entry 3381 (class 0 OID 33305)
-- Dependencies: 219
-- Data for Name: Devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public."Devices" ("Id", "Ip", "Port", "CommKey", "IsConnected", "Name") FROM stdin;
-- 35	192.168.1.201	4370	0	t	Cổng 3
-- \.


--
-- TOC entry 3385 (class 0 OID 33329)
-- Dependencies: 223
-- Data for Name: Sheets; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public."Sheets" ("Id", "DeviceId", "SheetName", "DocumentId") FROM stdin;
-- 40	35	Sheet1	1J_ksu0COMPtBoddnHp-r4qvAriS3Ddg3hsTo3-OUnXo
-- 41	35	Sheet2	1qPrnFffcnwIAkRHoyQnsuuAGkZaC1l3SSCn2KuZH3Zo
-- 42	35	Sheet3	1xdgwVu8Cbg19EYvwg8bwhrW0d-Q9ZNFv9AahfuhNpFE
-- \.


--
-- TOC entry 3383 (class 0 OID 33313)
-- Dependencies: 221
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public."Users" ("Id", "Name", "Password", "Role", "CardNo", "DisplayName", "DeviceIp", "UID", "UserId") FROM stdin;
-- 2757	Tien	123456	0	0	Tien	192.168.1.201	1	1000
-- 2759	Nguyen Van Tien	123456	3	0	Nguyen Van Tien	192.168.1.201	3	12345
-- 2928	nguyenvantien	234	3	0	Nguyễn Văn Tiến	192.168.1.201	4	123456
-- \.


--
-- TOC entry 3377 (class 0 OID 33293)
-- Dependencies: 215
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
-- 20240919083553_initial	8.0.8
-- 20240920044533_editnotification1	8.0.8
-- \.


--
-- TOC entry 3391 (class 0 OID 0)
-- Dependencies: 216
-- Name: Attendances_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attendances_Id_seq"', 94, true);


--
-- TOC entry 3392 (class 0 OID 0)
-- Dependencies: 218
-- Name: Devices_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Devices_Id_seq"', 36, true);


--
-- TOC entry 3393 (class 0 OID 0)
-- Dependencies: 220
-- Name: Employees_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Employees_Id_seq"', 2929, true);


--
-- TOC entry 3394 (class 0 OID 0)
-- Dependencies: 222
-- Name: Sheets_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Sheets_Id_seq"', 41, true);


--
-- TOC entry 3225 (class 2606 OID 33303)
-- Name: Attendances PK_Attendances; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendances"
    ADD CONSTRAINT "PK_Attendances" PRIMARY KEY ("Id");


--
-- TOC entry 3227 (class 2606 OID 33311)
-- Name: Devices PK_Devices; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Devices"
    ADD CONSTRAINT "PK_Devices" PRIMARY KEY ("Id");


--
-- TOC entry 3229 (class 2606 OID 33319)
-- Name: Users PK_Employees; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Employees" PRIMARY KEY ("Id");


--
-- TOC entry 3232 (class 2606 OID 33335)
-- Name: Sheets PK_Sheets; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sheets"
    ADD CONSTRAINT "PK_Sheets" PRIMARY KEY ("Id");


--
-- TOC entry 3223 (class 2606 OID 33297)
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- TOC entry 3230 (class 1259 OID 33359)
-- Name: IX_Sheets_DeviceId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Sheets_DeviceId" ON public."Sheets" USING btree ("DeviceId");


--
-- TOC entry 3233 (class 2606 OID 33336)
-- Name: Sheets FK_Sheets_Devices_DeviceId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sheets"
    ADD CONSTRAINT "FK_Sheets_Devices_DeviceId" FOREIGN KEY ("DeviceId") REFERENCES public."Devices"("Id") ON DELETE CASCADE;


-- Completed on 2024-10-14 17:17:18 UTC

--
-- PostgreSQL database dump complete
--

