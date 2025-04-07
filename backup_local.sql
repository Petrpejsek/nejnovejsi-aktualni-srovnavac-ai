--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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
-- Name: Product; Type: TABLE; Schema: public; Owner: ai_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    category text,
    "imageUrl" text,
    tags text,
    advantages text,
    disadvantages text,
    reviews text,
    "detailInfo" text,
    "pricingInfo" text,
    "videoUrls" text,
    "externalUrl" text,
    "hasTrial" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO ai_user;

--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: ai_user
--

COPY public."Product" (id, name, description, price, category, "imageUrl", tags, advantages, disadvantages, reviews, "detailInfo", "pricingInfo", "videoUrls", "externalUrl", "hasTrial", "createdAt", "updatedAt") FROM stdin;
88de1cbd-8c4a-4242-8192-a1f43c559ced	ChatGPT	Advanced AI chatbot for natural conversations and task assistance	20	AI Assistant	\N	["AI Assistant","Text Generation","Customer Support"]	["Very versatile and capable of handling various tasks","Natural conversation flow","Regular updates and improvements","Extensive knowledge base"]	["May occasionally provide incorrect information","Limited context window","No real-time information","Can be inconsistent in responses"]	\N	ChatGPT is an advanced AI tool that helps with ai assistant tasks. It provides professional features and regular updates to ensure the best possible results for your projects.	{"basic":"0","pro":"20","enterprise":"Custom"}	\N	\N	t	2025-02-15 13:15:18.282	2025-02-15 13:19:49.614
3ed80be2-62ea-4269-8fce-0a7fc64e33a1	Claude	Advanced AI assistant by Anthropic with enhanced reasoning and analysis capabilities	50	AI Assistant	\N	["AI Assistant","Text Generation","Data Analysis"]	["Strong analytical capabilities","Excellent at complex tasks","More nuanced responses","Good at following instructions"]	["Limited availability","Can be overly cautious","Slower response times","Higher pricing than some alternatives"]	\N	Claude is an advanced AI tool that helps with ai assistant tasks. It provides professional features and regular updates to ensure the best possible results for your projects.	{"basic":"20","pro":"50","enterprise":"Custom"}	\N	\N	f	2025-02-15 13:15:18.409	2025-02-15 13:19:49.788
c348e149-2f45-4643-8144-4f7e25bdf984	DALL-E	OpenAI's advanced image generation AI with precise control and editing capabilities	40	Image Generation	\N	["Image Generation","AI Art","Image Editing"]	["High accuracy in following prompts","Built-in image editing features","User-friendly interface","Consistent quality"]	["Credit-based system","Limited style options","No unlimited plan available","Some creative limitations"]	\N	DALL-E is an advanced AI tool that helps with image generation tasks. It provides professional features and regular updates to ensure the best possible results for your projects.	{"basic":"15","pro":"40","enterprise":"Custom"}	\N	\N	t	2025-02-15 13:15:18.383	2025-02-15 13:19:49.764
3950a308-316e-470d-8e28-9274c956ed27	Midjourney	AI-powered image generation tool for creating stunning artwork and illustrations	30	Image Generation	\N	["Image Generation","AI Art","Digital Design"]	["Exceptional image quality","Unique artistic style","Active community","Regular feature updates"]	["Learning curve for prompts","Queue times during peak hours","Limited control over specific details","Subscription required for full access"]	\N	Midjourney is an advanced AI tool that helps with image generation tasks. It provides professional features and regular updates to ensure the best possible results for your projects.	{"basic":"10","pro":"30","enterprise":"60"}	\N	\N	f	2025-02-15 13:15:18.332	2025-02-15 13:19:49.675
1e4132e6-2ad9-4423-a550-f9afa58e80e0	Stable Diffusion	Advanced AI tool for image generation tasks	20	Image Generation	\N	["Image Generation","AI Tool"]	["Easy to use interface","Regular updates","Professional features","Good value for money"]	["Learning curve for advanced features","Limited customization options","May require technical knowledge","Premium features require subscription"]	\N	Stable Diffusion is an advanced AI tool that helps with image generation tasks. It provides professional features and regular updates to ensure the best possible results for your projects.	{"basic":"0","pro":"20","enterprise":"Custom"}	\N	\N	t	2025-02-15 13:15:18.357	2025-02-15 13:19:49.7
\.


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: ai_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

