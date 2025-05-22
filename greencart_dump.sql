--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer,
    image_url text
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    in_stock boolean,
    quantity integer,
    brand text,
    category_id integer,
    retailer_id character varying(36),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id character varying(36) NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    name text,
    email text,
    password text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description) FROM stdin;
1	Electronics	Devices, gadgets, and accessories
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, image_url) FROM stdin;
699	1	https://m.media-amazon.com/images/I/61R16ML7VlL._AC_SL1084_.jpg
700	2	https://m.media-amazon.com/images/I/71awyXSBwkL._AC_SL1500_.jpg
701	3	https://m.media-amazon.com/images/I/81Cr1zeaXWL._AC_SL1500_.jpg
702	4	https://m.media-amazon.com/images/I/61kZC5InDEL._AC_SL1001_.jpg
703	5	https://m.media-amazon.com/images/I/91hUqLtVVaL._AC_SL1500_.jpg
704	6	https://m.media-amazon.com/images/I/61ilLw3PfML._AC_SL1500_.jpg
705	7	https://m.media-amazon.com/images/I/710IS+4qQrL._AC_SL1500_.jpg
706	8	https://m.media-amazon.com/images/I/7173De8QmTL._AC_SL1500_.jpg
707	9	https://m.media-amazon.com/images/I/61h5hV+l3RL._AC_SL1000_.jpg
708	10	https://m.media-amazon.com/images/I/71m-9WM8CXL._AC_SL1500_.jpg
709	11	https://m.media-amazon.com/images/I/71-vFNR3jWL._AC_SL1500_.jpg
710	12	https://m.media-amazon.com/images/I/615ZyRGaKVL._AC_SL1500_.jpg
711	13	https://m.media-amazon.com/images/I/81R-aI0ZBbL._SL1500_.jpg
712	14	https://m.media-amazon.com/images/I/71NcX2NWE2L._AC_SL1500_.jpg
713	15	https://m.media-amazon.com/images/I/61VfHJm66LL._AC_SL1500_.jpg
714	16	https://m.media-amazon.com/images/I/71f8otUKZiL._AC_SL1500_.jpg
715	17	https://m.media-amazon.com/images/I/71A0bzX910L._AC_SL1500_.jpg
716	18	https://m.media-amazon.com/images/I/41d-oDM1fHL._AC_SL1000_.jpg
717	19	https://m.media-amazon.com/images/I/71RX2h6DJlL._AC_SL1500_.jpg
718	20	https://m.media-amazon.com/images/I/61ZwVdcFjLL._AC_SL1000_.jpg
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, in_stock, quantity, brand, category_id, retailer_id, created_at) FROM stdin;
4	SIDIANBAN Desktop Organizer Shelf Office Storage Rack Computer Desk Bookshelf Adjustable Display Shelf for Office Supplies (Black)	SIDIANBAN Desktop Organizer Shelf Office Storage Rack Computer Desk Bookshelf Adjustable Display Shelf for Office Supplies (Black)	22.99	t	18	SIDIANBAN	1	1	2025-05-21 19:37:24.812444
5	STABILO Fineliner point 88 MINI - Wallet of 12 - Assorted Colors	STABILO Fineliner point 88 MINI - Wallet of 12 - Assorted Colors	11.96	t	22	STABILO	1	1	2025-05-21 19:37:24.825678
6	MUNBYN White Cash Drawer, 16\\" Heavy Duty Cash Register for Point of Sale (POS) System, 5 Bill/5 Coin, Removable Coin Tray, RJ11/RJ12 Interface 2 Key-Lock, Works for Square Business, Money Drawer	MUNBYN White Cash Drawer, 16\\" Heavy Duty Cash Register for Point of Sale (POS) System, 5 Bill/5 Coin, Removable Coin Tray, RJ11/RJ12 Interface 2 Key-Lock, Works for Square Business, Money Drawer	67.99	t	16	MUNBYN	1	1	2025-05-21 19:37:24.833046
7	S&O Watercolor Floral Wall Calendar from January 2025-June 2026 - Tear-Off Monthly Calendar - 18 Month Academic Wall Calendar - Hanging Calendar to Track for Anniversaries & Appointments - 13.5\\"x10.5 in	S&O Watercolor Floral Wall Calendar from January 2025-June 2026 - Tear-Off Monthly Calendar - 18 Month Academic Wall Calendar - Hanging Calendar to Track for Anniversaries & Appointments - 13.5\\"x10.5 in	9.99	t	12	Sweetzer & Orange	1	1	2025-05-21 19:37:24.840014
8	GEAK 3 Pack Compatible with Apple Watch Case 38mm, Soft HD High Sensitivity Screen Protector with TPU All Around Anti-Fall Bumper Protective Case Cover for iWatch Series 3/2/1 38mm (3 Clear)	GEAK 3 Pack Compatible with Apple Watch Case 38mm, Soft HD High Sensitivity Screen Protector with TPU All Around Anti-Fall Bumper Protective Case Cover for iWatch Series 3/2/1 38mm (3 Clear)	5.53	t	20	GEAK	1	1	2025-05-21 19:37:24.847956
9	Metronic Poly Mailers 10x13 100 Pcs | Medium Shipping Bags for Clothing | Mailing Bags for Small Business, Shipping Envelopes, Packing Bags in White	Metronic Poly Mailers 10x13 100 Pcs | Medium Shipping Bags for Clothing | Mailing Bags for Small Business, Shipping Envelopes, Packing Bags in White	9.99	t	35	METRONIC	1	1	2025-05-21 19:37:24.854942
10	Panasonic Cordless Phone, Easy to Use with Large Display and Big Buttons, Flashing Favorites Key, Built in Flashlight, Call Block, Volume Boost, Talking Caller ID, 2 Cordless Handsets - KX-TGU433W	Panasonic Cordless Phone, Easy to Use with Large Display and Big Buttons, Flashing Favorites Key, Built in Flashlight, Call Block, Volume Boost, Talking Caller ID, 2 Cordless Handsets - KX-TGU433W	74.99	t	28	Panasonic	1	1	2025-05-21 19:37:24.862417
11	Yellow Legal Pads, Note Pads, 4 x 6 Inch, 8 Pack, 30 Sheets/Pad, Narrow Ruled, Small Notepads Yellow Paper, Micro Perforated Memo Pads, Lined Writing Pads of Paper, Mini Pocket Size Scratch Pads 4x6	Yellow Legal Pads, Note Pads, 4 x 6 Inch, 8 Pack, 30 Sheets/Pad, Narrow Ruled, Small Notepads Yellow Paper, Micro Perforated Memo Pads, Lined Writing Pads of Paper, Mini Pocket Size Scratch Pads 4x6	9.99	t	30	Roneky	1	1	2025-05-21 19:37:35.22122
12	Belkin MagSafe Vent Mount Pro - MagSafe Phone Mount for Car, Magnetic Phone Holder Compatible with iPhone 16, iPhone 16 Pro, iPhone 16 Pro Max, iPhone 15 Series, iPhone 14 Series, and Mini - Gray	Belkin MagSafe Vent Mount Pro - MagSafe Phone Mount for Car, Magnetic Phone Holder Compatible with iPhone 16, iPhone 16 Pro, iPhone 16 Pro Max, iPhone 15 Series, iPhone 14 Series, and Mini - Gray	29.99	t	18	Belkin	1	1	2025-05-21 19:37:35.231696
13	Wireless Phone Controller for iPhone/Android With Hall Joystick and RGB, Mobile Gaming Controller for iOS Support Xbox Game Pass, PlayStation, Steam Link, Call of Duty,Roblox, Minecraft, Cloud Gamepad	Wireless Phone Controller for iPhone/Android With Hall Joystick and RGB, Mobile Gaming Controller for iOS Support Xbox Game Pass, PlayStation, Steam Link, Call of Duty,Roblox, Minecraft, Cloud Gamepad	49.99	t	25	KICKDOT	1	1	2025-05-21 19:37:35.239315
14	Cool Fourth Wing Bookmark - Gift for Fantasy Novel Lovers Dragon Bookmarks Gifts for Book Lovers Novel Fans Bookworm Teacher Page Markers for Men Books Accessories Students Birthday Gifts	Cool Fourth Wing Bookmark - Gift for Fantasy Novel Lovers Dragon Bookmarks Gifts for Book Lovers Novel Fans Bookworm Teacher Page Markers for Men Books Accessories Students Birthday Gifts	4.90	t	20	Berirexrion	1	1	2025-05-21 19:37:35.246851
15	OnTheGrip Compatible with Magsafe Magnetic Authentic Cute Solid Color Daisy Flower Design Collapsible Mobile Phone Grip Stand Holder for Smartphone Tablet Cell Phone Accessory (Magsafe Type, Pink)	OnTheGrip Compatible with Magsafe Magnetic Authentic Cute Solid Color Daisy Flower Design Collapsible Mobile Phone Grip Stand Holder for Smartphone Tablet Cell Phone Accessory (Magsafe Type, Pink)	19.99	t	22	On The Grip	1	1	2025-05-21 19:37:35.254084
16	Chair Pockets for Classroom 15.6x16.8 Inch - 12 Pack Chairback Buddy Pocket Chart Seat Back Organizer Student Storage with Label Slot for Classroom Kindergarten School Home (Multicolors)	Chair Pockets for Classroom 15.6x16.8 Inch - 12 Pack Chairback Buddy Pocket Chart Seat Back Organizer Student Storage with Label Slot for Classroom Kindergarten School Home (Multicolors)	34.99	t	15	AZKAQA	1	1	2025-05-21 19:37:35.262318
17	myCartridge 24 Pack ERC30 ERC-30 ERC 30 34 38 B/R Compatible with Ribbon Cartridge Used with Epson ERC30/ERC34/ERC38,TM-U220,Bixolon GRC-220BR,M188B,BTP-M300 Printer (Black and Red)	myCartridge 24 Pack ERC30 ERC-30 ERC 30 34 38 B/R Compatible with Ribbon Cartridge Used with Epson ERC30/ERC34/ERC38,TM-U220,Bixolon GRC-220BR,M188B,BTP-M300 Printer (Black and Red)	24.98	t	28	myCartridge	1	1	2025-05-21 19:37:35.269545
18	UNIQOOO Thick Clear Acrylic Clipboard with Shiny Gold Finish Clip, Perfect for Modern Arts Lover, Fashion and Style Expert, Calligrapher, Office, Seminars, Workshops, Home School, Classroom and Event	UNIQOOO Thick Clear Acrylic Clipboard with Shiny Gold Finish Clip, Perfect for Modern Arts Lover, Fashion and Style Expert, Calligrapher, Office, Seminars, Workshops, Home School, Classroom and Event	8.99	t	12	UNIQOOO	1	1	2025-05-21 19:37:35.277151
19	SABANI Portable Charger 35000mAh Power Bank - Portable Battery with 4 Built in Cables, 22.5W Fast Charging Battery Pack Compatible with iPhone 16 15 14 13 Samsung Android Phone etc (1 Pack, Black)	SABANI Portable Charger 35000mAh Power Bank - Portable Battery with 4 Built in Cables, 22.5W Fast Charging Battery Pack Compatible with iPhone 16 15 14 13 Samsung Android Phone etc (1 Pack, Black)	29.98	t	20	SABANI	1	1	2025-05-21 19:37:35.284339
20	Klein Tools 56250 Wire Marker Book for Cable Management, Electric Panel Organization Wire Label Stickers, Numbered 1-48	Klein Tools 56250 Wire Marker Book for Cable Management, Electric Panel Organization Wire Label Stickers, Numbered 1-48	13.97	t	14	Klein Tools	1	1	2025-05-21 19:37:35.292146
1	Soundcore Select 4 Go Bluetooth Shower Speaker by Anker, IP67 Waterproof/Dustproof, Portable Speaker, Wireless, 20H Playtime, Floatable, Powerful Sound, Electronics for Outdoors/Home/Office/Travel	Soundcore Select 4 Go Bluetooth Shower Speaker by Anker, IP67 Waterproof/Dustproof, Portable Speaker, Wireless, 20H Playtime, Floatable, Powerful Sound, Electronics for Outdoors/Home/Office/Travel	29.99	t	25	Soundcore	1	1	2025-05-21 19:36:53.617627
2	Vaydeer Metal Pen Holder Aluminum Pencil Holder for desk, Round Desktop Organizer and Black Pencil Cup for Office, School, Home and Stationary Supplies (3.15 x 3.15 x 3.94 Inches)	Vaydeer Metal Pen Holder Aluminum Pencil Holder for desk, Round Desktop Organizer and Black Pencil Cup for Office, School, Home and Stationary Supplies (3.15 x 3.15 x 3.94 Inches)	13.59	t	30	Vaydeer	1	1	2025-05-21 19:36:53.628898
3	TN450 Toner Cartridge for Brother Printer - Replacement for Brother TN450 TN420 TN-450 TN-420 to Compatible with HL-2270DW HL-2280DW HL-2230 MFC-7360N MFC-7860DW Intellifax 2840 2940, 2 Black	TN450 Toner Cartridge for Brother Printer - Replacement for Brother TN450 TN420 TN-450 TN-420 to Compatible with HL-2270DW HL-2280DW HL-2230 MFC-7360N MFC-7860DW Intellifax 2840 2940, 2 Black	32.49	t	20	VIPSIM	1	1	2025-05-21 19:36:53.637184
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, created_at) FROM stdin;
retailer-001	GreenStore	retailer@example.com	hashedpassword123	2025-05-21 18:50:20.291074
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 718, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 209, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

