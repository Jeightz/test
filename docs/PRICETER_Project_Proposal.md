# PRICETER: A Crowdsourced Price Verification

**ACES Tagum College**

A Project Proposal Presented in Compliance to the Course:

**SE101 – Software Engineering**

**Ampong, Jay E.**  
**Cervantes, Khegie N.**  
**Igagamao, Joriel Anne C.**  
**Lobo, Jellian Jade I.**  
**Pareja, Tyrone Ken P.**

Adviser

**August 2026**

---

## Table of Contents

- Chapter 1 Introduction
  - 1.1 Background of the Project
  - 1.2 Theoretical Framework
  - 1.3 Statement of the Problem
  - 1.4 Objectives of the Study
  - 1.5 Scope and Limitations
  - 1.6 Significance of the Study
- Chapter 2 Review of Related Literature, Studies, and Definition of Terms
  - 2.1 Related Literature
  - 2.2 Related Studies
  - 2.3 Local Context
  - 2.4 Synthesis
  - 2.5 Definition of Terms
- Chapter 3 Methodology
  - 3.1 Development Approach
  - 3.2 Agile Software Development Life Cycle
  - 3.3 Technology Stack
  - 3.4 Hardware and Software Requirements
- Chapter 4 Software Development Specification
  - 4.1 Functional Requirements
  - 4.2 Non-Functional Requirements
- Chapter 5 System Analysis and Design
  - 5.1 Use Case Diagram
  - 5.2 Data Flow Diagram
  - 5.3 Entity Relationship Diagram
  - 5.4 Data Dictionary
  - 5.5 System Architecture
- References

---

# CHAPTER 1  
# INTRODUCTION

This chapter presents the background of PRICETER, the theories that support the system, the problem it addresses, the objectives of the study, the scope and limitations, and the significance of the project.

## 1.1 Background of the Project

The growth of digital technology has changed how consumers search for information, compare products, and make purchasing decisions. Digital platforms have made product and price information more accessible, allowing consumers to compare available choices before buying. However, consumers may still find it difficult to determine whether a price is reasonable when they do not have sufficient or reliable information about prevailing market prices.

The Organisation for Economic Co-operation and Development (OECD) emphasizes that digital markets provide consumers with greater convenience and more choices, but they also create challenges related to transparency, trust, and informed decision-making [1]. Information asymmetry occurs when one party in a transaction has more relevant information than the other, which can weaken a consumer’s ability to make an informed choice. Accessible and reliable pricing information is therefore increasingly important in modern markets. Technologies that provide transparent, timely, and easy-to-access price information can help consumers make better purchasing decisions and promote greater fairness in the marketplace.

Several existing technologies already help consumers access and compare prices. These include online marketplaces, price comparison platforms, customer review and rating systems, and government price-monitoring services. In the Philippines, the Department of Trade and Industry (DTI) publishes Suggested Retail Prices (SRPs) for selected basic necessities and prime commodities to help consumers determine appropriate retail prices [2]. These systems remain limited when consumers need localized, community-generated, and near real-time price information, particularly from small local stores, sari-sari stores, and individual vendors. Online price comparison platforms also tend to focus on registered businesses and e-commerce listings rather than prices actually observed by consumers in their local communities.

**PRICETER: A Crowdsourced Price Verification** addresses this gap through a community-driven, web-based approach. Users can anonymously submit photos of price tags, receipts, or menus together with the corresponding price and location. The system aggregates reports from the same area, calculates local median prices, and provides a Fair, High, or Overpriced indicator. It also incorporates a Community Trust Score and government reference prices, such as DTI SRPs, to strengthen the reliability of its price assessment.

The identified problem of unfair and excessively high pricing is evident in the Philippine context, particularly in essential goods such as rice. Data from the Philippine Statistics Authority (2026) indicates that retail rice prices remain high, ranging from approximately ₱50 to ₱58 per kilogram in 2026, despite government interventions and fluctuations in supply [8]. Reports also show that rice inflation has remained significant, reflecting continued price increases even when policies are intended to stabilize the market [9]. Studies further indicate that retail prices often do not decrease even when wholesale or import costs decline, suggesting supply-chain inefficiencies and possible price manipulation among traders [10], [11], [12].

The issue of price transparency is also relevant to consumers in Tagum City and the surrounding Davao del Norte community. The Philippine Statistics Authority reported that Davao del Norte’s inflation rate increased to 9.6 percent in April 2026 from 7.0 percent in March, with food and non-alcoholic beverages contributing the largest share of the increase at 56.3 percent. Food inflation also increased to 11.4 percent, with rice and other food commodities contributing to the continued increase in consumer prices [13]. These conditions can affect consumers associated with ACES Tagum College, particularly students and other individuals who regularly purchase food, school-related products, and daily necessities within the local community.

Although government agencies such as the DTI provide Suggested Retail Prices and monitored price information, available government references may not represent the actual prices observed in every local establishment [14], [15]. Consumers still need accessible local information that allows them to compare prices based on actual observations in their surrounding community.

To address this gap, PRICETER is proposed as a web-based platform intended to improve consumers’ access to localized and transparent price information. The system aims to support informed purchasing decisions by providing a community-based reference for comparing observed product prices with available government pricing information [16]. Through the collective contribution of consumers, PRICETER seeks to strengthen price transparency and help users recognize potentially excessive or inconsistent prices in their local market. The proposed system is intended to complement existing consumer-protection and price-monitoring initiatives rather than replace official government price regulations or enforcement mechanisms [17].

## 1.2 Theoretical Framework

The proposed PRICETER system is supported by concepts and theories that explain consumer behavior, pricing fairness, and information sharing.

**Information Asymmetry Theory** provides a foundation for the project because consumers may have less information about prevailing prices than sellers. By gathering and presenting price information from multiple consumers, PRICETER aims to reduce this information gap and help buyers make more informed decisions.

**Price Fairness** supports the system’s Fair, High, or Overpriced indicator. Consumers’ perceptions of fairness can be affected when the price they encounter differs significantly from what they expect or observe in the market. Eyster, Madarász, and Michaillat (2020) explain that fairness concerns can influence how consumers perceive pricing decisions [3].

**Crowdsourcing** supports PRICETER’s community-driven approach, in which users contribute information that can be collectively analyzed to generate useful local price references.

These theories and concepts provide a foundation for PRICETER’s objective of reducing information asymmetry, improving price transparency, and helping consumers identify potentially excessive prices.

## 1.3 Statement of the Problem

Consumers in Tagum City and nearby communities often lack a reliable, localized, and accessible source of actual market prices. Existing online comparison tools and government SRP listings do not fully capture prices observed in small local stores and community vendors. As a result, consumers may overpay, misjudge fairness, and remain dependent on incomplete or outdated information.

This study therefore seeks to answer the following questions:

1. How can a web-based system allow consumers to search products, view reported prices, and access current DTI SRP information?
2. How can anonymous product reports, including name, price, location, and photo evidence, be collected without requiring user accounts?
3. How can a price indicator classify a product as Fair, High, or Overpriced using government SRP data and community reports?
4. How can local median prices be computed and presented at nearby, barangay, and city levels?
5. How can a Community Trust Score help users evaluate the consistency of crowdsourced price data?
6. How can usage restrictions limit spam reporting and spam rating while preserving anonymity?

## 1.4 Objectives of the Study

### 1.4.1 General Objective

To design and develop **PRICETER: A Crowdsourced Price Verification**, a web-based application that helps consumers make informed purchasing decisions through anonymous, community-generated price reports, government SRP comparison, and a transparent Fair, High, or Overpriced indicator.

### 1.4.2 Specific Objectives

1. Design and develop a web-based application that allows consumers to:
   1. Search for a product
   2. Report a product price
   3. View product details
   4. View current government product pricing (SRP)
2. Implement anonymous contribution for data input and monitoring that can support:
   1. Government reference use
   2. Seller and market comparison
3. Develop a price indicator that classifies prices using government SRP values and user reports as:
   1. Fair
   2. High
   3. Overpriced
4. Ensure that the platform is user-friendly, accessible, and responsive on:
   1. Desktops
   2. Smartphones
   3. Tablets
5. Develop a report interface that captures essential product information, including:
   1. Product name
   2. Price
   3. Location
   4. Real-time photo
6. Build a Community Trust Score module that allows users to:
   1. Assess data consistency
   2. Report user experience with submitted information
   3. Rate the consistency of the data
7. Build a local median module that makes product searching more useful by allowing users to:
   1. See nearby items
   2. View barangay-based items
   3. View city-based items
8. Build a restriction module that limits usage of:
   1. Reporting an item
   2. Rating an item

## 1.5 Scope and Limitations

PRICETER is designed to give consumers centralized access to crowdsourced product pricing data and to support price verification. Consumers can submit a report containing the product name, price, location, and a real-time photo of the product. The system verifies prices using user reports and government SRP data, then classifies the product as Fair, High, or Overpriced.

A user account is not required. The system uses anonymous reporting together with a restriction module that limits usage in order to reduce spam reports and spam ratings. To strengthen data consistency, a Community Trust Score allows users to indicate whether reported information appears accurate or unreliable.

The platform will be developed as a web-based application using **React**, **Next.js**, and **PostgreSQL**, optimized for modern browsers and accessible across desktop and mobile devices.

**Limitations:**

1. The current release does not include a standalone mobile application, although the system is optimized for mobile and desktop browsers.
2. A stable internet connection is required to retrieve crowdsourced price data.
3. The consistency of crowdsourced data depends on user-submitted reports and may require community verification.
4. The system does not guarantee that every reported price is the current actual selling price of the product.
5. The system is limited to user-submitted reports and government SRP data.
6. The system does not replace DTI regulation, market inspection, or legal enforcement.

## 1.6 Significance of the Study

This study is significant to the following:

**Consumers.** PRICETER provides a practical way to compare observed local prices with community medians and government SRP values, supporting more informed purchasing decisions.

**Students and the ACES Tagum College community.** The system offers a localized reference for everyday purchases of food and other necessities in Tagum City.

**Local vendors and the market.** Transparent community price information may encourage fairer pricing practices.

**Government agencies.** The platform complements existing DTI price-monitoring efforts by capturing community-level observations that official listings may not fully cover.

**Future researchers and developers.** The project documents a crowdsourced verification model, an anonymous session design, and a PostgreSQL schema that later studies can extend.

---

# CHAPTER 2  
# REVIEW OF RELATED LITERATURE, STUDIES, AND DEFINITION OF TERMS

This chapter reviews related literature and studies that support the need for PRICETER. It also defines the terms used in this study.

## 2.1 Related Literature

Previous studies have identified several problems in existing pricing practices. One major issue is the widespread use of dynamic pricing strategies among retailers. Although these strategies can maximize profits, they often lead to disproportionate price increases during periods of high demand [4]. Such practices may result in prices that exceed the perceived fair value of products, placing financial strain on consumers and contributing to negative perceptions of market fairness.

The lack of transparency in pricing mechanisms also restricts consumers’ ability to understand how prices are determined, thereby reducing trust in businesses. Individuals tend to underestimate actual production and operational costs and rely on prior assumptions when evaluating prices, leading to inaccurate judgments about fairness [7]. This misinterpretation becomes more pronounced during inflationary periods and further limits consumers’ ability to make informed purchasing decisions.

These limitations highlight the need for improved systems that promote price transparency, strengthen consumer awareness, and provide reliable pricing information.

## 2.2 Related Studies

Evidence from the Philippine rice market shows that despite reduced import costs and supportive policies such as the Rice Tariffication Law, retail prices remain persistently high [5]. This situation has been attributed to weak market competition, supply-chain inefficiencies, and strategic trading behaviors that limit the transfer of cost reductions to consumers [6].

Studies also indicate structural issues in the Philippine rice market, including price distortions and weak transmission between global and domestic prices, as well as significant wholesale–retail price spreads [11]. Reports from the Department of Science and Technology–Philippine Council for Agriculture, Aquatic and Natural Resources Research and Development show that rice prices increased substantially despite production changes, indicating inefficiencies in distribution and market systems [12]. These conditions demonstrate that consumers are frequently unable to access fair pricing, leading to financial strain and reduced purchasing power, especially among low-income households.

A study on the development and implementation of an e-School System for a Northern Mindanao community college used the Agile Model to develop and improve the system’s major functionalities and modules. The study evaluated the system using the ISO 25010 software quality model and found average ratings above 4.04 for functionality, usability, and reliability, indicating very good performance on the Likert scale. The study also found that the system enhanced school transactions and provided benefits to faculty and staff [18]. These findings support the use of the Agile Model in PRICETER, particularly because both systems involve multiple modules that can be developed and improved over time.

## 2.3 Local Context

The Philippine Statistics Authority reported that Davao del Norte’s inflation rate increased to 9.6 percent in April 2026 from 7.0 percent in March, with food and non-alcoholic beverages contributing the largest share of the increase [13]. Government agencies such as the DTI provide Suggested Retail Prices and conduct market surveillance to promote compliance with fair-trade laws [14], [15]. However, official references may not represent prices observed in every local establishment. PRICETER is therefore positioned as a localized complement to existing consumer-education and price-monitoring initiatives [16], [17].

## 2.4 Synthesis

Related literature and studies show that consumers face information gaps, perceived unfair pricing, and limited access to localized market data. Government SRP listings are valuable but incomplete as a stand-alone reference for community-level prices. PRICETER responds to these findings by combining crowdsourced reports, local median computation, SRP comparison, a price indicator, and a community trust mechanism in a single web application.

## 2.5 Definition of Terms

The following terms are used in this study:

**SRP (Suggested Retail Price).** The recommended price published for a product, especially basic necessities and prime commodities, as a guide for consumers and sellers.

**DTI (Department of Trade and Industry).** The government agency that monitors and publishes SRP information to guide consumers toward recommended selling prices.

**Local Median.** The middle value of prices collected from different reports within a specific local area after the prices are arranged from lowest to highest.

**Price Indicator.** The system classification of a product price as Fair, High, or Overpriced based on available SRP data and local reports.

**Community Trust Score.** A community-generated rating of the consistency and reliability of submitted price information.

**Crowdsourcing.** The practice of collecting information from many users and aggregating that information into a shared reference.

**Anonymous Reporting.** The submission of price reports without creating a user account, using a device session instead of personal credentials.

**Device Session.** An anonymous identifier stored for a browser or device, used to associate reports, ratings, and usage limits without collecting personal identity.

**Usage Restriction.** A limit on the number of reports and ratings a device session may submit within a given period, intended to reduce spam and abuse.

**Next.js.** A React-based web framework used to build the PRICETER application, including pages, server-side logic, and API endpoints.

**React.** A JavaScript library used to build the interactive user interface of PRICETER.

**PostgreSQL.** An open-source relational database used to store products, reports, addresses, SRP records, trust ratings, and device-session data.

---

# CHAPTER 3  
# METHODOLOGY

This chapter presents the development approach, the software development life cycle, the technology stack, and the hardware and software requirements used in building PRICETER.

## 3.1 Development Approach

This chapter describes the process of collecting the essential data and information needed for the project and the method used to develop the system. The Software Development Life Cycle (SDLC) is used to provide a structured approach to development and implementation. The team selected the **Agile Model** as the development methodology. This approach focuses on features that can be developed and improved over time, such as DTI SRP comparison, the price indicator, local median pricing, and the Community Trust Score.

The Agile Model allows the project to be developed in smaller stages, tested feature by feature, and improved throughout development based on feedback. This approach supports the project goal of providing accessible and reliable local price information while continuously improving functionality according to user needs.

In developing PRICETER, the team adopts a user-centered approach to ensure that the system meets the needs of its intended users. Because PRICETER includes product reporting, DTI SRP comparison, local median pricing, and a Community Trust Score, the system must be developed and improved gradually based on user needs and feedback. Agile supports iterative development, continuous testing, and flexible changes throughout the process.

## 3.2 Agile Software Development Life Cycle

**Figure 1.** Agile Software Development Model

*(Insert Figure 1 here.)*

Through the Agile approach, the PRICETER development cycle develops the system in smaller iterations, tests each feature, identifies problems, and makes improvements based on user feedback. Features such as price reporting, SRP comparison, local median pricing, and price verification can therefore be refined continuously. As a result, the development process remains flexible and helps ensure that PRICETER continues to meet consumer needs.

## 3.3 Technology Stack

PRICETER is implemented as a **React + Next.js + PostgreSQL** web application.

| Layer | Technology | Purpose |
| --- | --- | --- |
| User interface | React | Renders search, report, product-detail, SRP, indicator, and trust-score screens |
| Application framework | Next.js | Provides routing, server-side rendering or server components, and API routes or server actions |
| Database | PostgreSQL | Stores products, categories, reports, addresses, SRP records, trust ratings, device sessions, and device logs |
| File storage | Cloud object storage | Stores real-time photos of price tags, receipts, or menus |
| Runtime | Node.js | Executes the Next.js application |

**React** is used to build a responsive, component-based interface that works on desktops, smartphones, and tablets.

**Next.js** is used as the full-stack framework so the same project can serve the user interface and the backend endpoints that create reports, compute local medians, compare SRP values, apply usage limits, and return product details.

**PostgreSQL** is used as the relational database because the system depends on structured relationships among products, locations, reports, SRP records, and anonymous device sessions. PostgreSQL also supports decimal price values, date and timestamp types, and queries needed for median and location-based aggregation.

## 3.4 Hardware and Software Requirements

### 3.4.1 Hardware Requirements (Development and Deployment)

| Component | Minimum specification |
| --- | --- |
| Processor | Dual-core CPU or equivalent |
| Memory | 8 GB RAM (development); 2 GB RAM (server deployment) |
| Storage | 20 GB available disk space |
| Network | Stable internet connection |

### 3.4.2 Software Requirements

| Component | Requirement |
| --- | --- |
| Client | Modern web browser (Chrome, Edge, Firefox, or Safari) |
| Client devices | Desktop, smartphone, or tablet |
| Development | Node.js, npm, Git |
| Framework | Next.js with React |
| Database | PostgreSQL |
| Operating system (server) | Linux or equivalent hosting environment |

---

# CHAPTER 4  
# SOFTWARE DEVELOPMENT SPECIFICATION

This chapter specifies the functional and non-functional requirements of PRICETER.

## 4.1 Functional Requirements

The following functional requirements define the expected functions and operations of PRICETER. These requirements describe the system features that allow consumers to search for products, submit price reports, compare prices with government references, and access localized price information.

**FR-01. Product search.** The system shall allow users to search for products.

1. Search by product name
2. View available product information
3. View reported prices for the selected product
4. View nearby reported items

**FR-02. Anonymous price reporting.** The system shall allow users to submit anonymous product price reports and view product details, including:

1. Product name
2. Product price
3. Product location
4. Real-time photo of the product, receipt, price tag, or menu

**FR-03. Government price reference.** The system shall provide government reference prices.

1. Display the latest DTI Suggested Retail Prices (SRP)
2. Allow users to compare reported prices with the available SRP
3. Display the applicable government price reference for a product when available

**FR-04. Price indicator.** The system shall provide a price indicator based on available price information.

1. Fair
2. High
3. Overpriced
4. Compare reported prices with the applicable DTI SRP and local price information

**FR-05. Local median price.** The system shall provide local median price information.

1. Display nearby reported prices
2. Display prices based on barangay-level location
3. Display prices based on city-level location
4. Calculate the median price from available local price reports

**FR-06. Community Trust Score.** The system shall provide a Community Trust Score.

1. Evaluate the consistency of submitted price data
2. Allow users to report their experience with the submitted information
3. Provide a consistency rating for the reported product

**FR-07. Usage restriction.** The system shall provide usage restriction.

1. Limit the number of product reports that can be submitted
2. Limit the number of ratings that can be given
3. Help prevent spam reports and spam ratings

**FR-08. Multi-device access.** The system shall allow users to access PRICETER through different devices.

1. Desktop
2. Smartphones
3. Tablets

**FR-09. Localized price information.** The system shall provide localized price information to consumers.

1. Organize reported prices according to location
2. Allow users to compare prices from different establishments
3. Present community-generated price information to support informed purchasing decisions

## 4.2 Non-Functional Requirements

The following non-functional requirements define the quality, performance, security, compatibility, reliability, and usability characteristics of PRICETER.

**NFR-01. Performance.** The system shall provide fast response times when users search for products, view price information, and submit reports, supported by localized PostgreSQL queries.

**NFR-02. Usability.** The system shall provide a simple, user-friendly interface that makes navigation and use straightforward.

**NFR-03. Accessibility.** The system shall be accessible through modern web browsers and usable on desktops, smartphones, and tablets.

**NFR-04. Responsiveness.** The system interface shall adapt to different screen sizes to provide a consistent experience across supported devices.

**NFR-05. Reliability.** The system shall properly store and display submitted price reports and available government price references in PostgreSQL.

**NFR-06. Data consistency.** The system shall maintain consistent price information and provide mechanisms such as the Community Trust Score to help users evaluate crowdsourced reports.

**NFR-07. Security and privacy.** The system shall protect submitted price reports and maintain user anonymity when reports are submitted. Personal accounts and credentials are not required.

**NFR-08. Efficiency.** The system shall efficiently process price reports and calculate local median prices and price indicators based on available data.

**NFR-09. Maintainability.** The system shall be structured, using Next.js application routes and React components, so that features such as price indicators, SRP references, local pricing data, and community verification can be updated and maintained when necessary.

---

# CHAPTER 5  
# SYSTEM ANALYSIS AND DESIGN

This chapter presents the analysis of the proposed system, PRICETER. It includes diagrams that illustrate user interaction, data processing, and data storage.

## 5.1 Use Case Diagram

Figure 2 illustrates the PRICETER use case diagram, showing the interaction between the user and the system. PRICETER operates without user accounts in order to preserve anonymity and make the system easier to use. A single actor, **User (Consumer)**, represents a consumer who accesses the platform.

The actor can perform the following use cases:

| Use case | Description |
| --- | --- |
| Search Product | Find a product and view related price information |
| Submit Report | Submit an anonymous price report with a real-time photo as supporting evidence |
| Rate Product Data | Evaluate the consistency of reported product data |
| View SRP Comparison | Display the government-set reference price |
| View Local Median Prices | Display the community-computed median price |
| View Price Indicator | Display the Fair, High, or Overpriced classification |

The system also performs **Enforce Usage Limits** to prevent spam or abuse of reporting and rating. These interactions enable consumers to verify product prices, contribute to the community, and make purchasing decisions more easily.

**Figure 2.** Use Case Diagram

*(Insert Figure 2 here.)*

## 5.2 Data Flow Diagram

### 5.2.1 Context Diagram (Level 0)

Figure 3 shows the Level 0 Data Flow Diagram of the PRICETER system. It provides a context view of how data moves between the user and the system.

Data enters the system when the user submits a price report, searches for a product, rates a product, views SRP data, or views local median prices. These flows enter Process 0, PRICETER. Within this process, the submitted data or requested action is validated, matched against existing product records, and compared with government SRP data and other crowdsourced reports. Processed data is then returned to the user through confirmation of the report, search results, rating results, current SRP data, local median prices, and the price indicator.

**Figure 3.** Data Flow Diagram (Level 0)

*(Insert Figure 3 here.)*

### 5.2.2 Level 1 Data Flow Diagram

Figure 4 shows the Level 1 Data Flow Diagram of the PRICETER system. It provides a more detailed view of how data is stored and processed, including validation, product matching, SRP comparison, median computation, trust scoring, and usage-limit checking against PostgreSQL data stores.

**Figure 4.** Data Flow Diagram (Level 1)

*(Insert Figure 4 here.)*

## 5.3 Entity Relationship Diagram

Figure 5 illustrates the conceptual design of the PRICETER database. The schema supports anonymized, crowdsourced price verification without user accounts or credentials. The Entity Relationship Diagram (ERD) is composed of eight main entities that define how data is organized and interconnected.

At the core of the design is the **product** entity, which stores the product name and is linked to **category** through a one-to-many relationship: one category may contain many products. The **report** entity records each crowdsourced submission, including price, photo URL, and date reported. It is connected to **product**, **address**, and **device_session** through foreign keys in order to identify what was reported, where it was reported, and which anonymous device submitted it.

The **address** entity stores the barangay, city, country, and longitude and latitude coordinates associated with a report, enabling local median price computation. The **srp** entity stores the government-issued price and its effective date for each product, allowing the system to compute the price indicator. The **trust_rating** entity records consistency ratings submitted for a given report by a device session. The **device_log** entity tracks the actions of each device session in order to enforce usage limits on reporting and rating.

Together, these entities provide effective data tracking and anonymous participation and form the foundation of the PostgreSQL relational schema.

**Figure 5.** Entity Relationship Diagram (ERD)

*(Insert Figure 5 here.)*

**Relationships**

| Parent | Child | Relationship |
| --- | --- | --- |
| category | product | One category has many products |
| product | report | One product has many reports |
| product | srp | One product may have many SRP records over time |
| address | report | One address may be used by many reports |
| device_session | report | One session may submit many reports |
| device_session | trust_rating | One session may submit many ratings |
| device_session | device_log | One session has many logs |
| report | trust_rating | One report may receive many trust ratings |

## 5.4 Data Dictionary

This section presents the PostgreSQL database schema used in PRICETER, including field names, data types, and descriptions.

### Table 1. product

| Field name | Data type | Description |
| --- | --- | --- |
| product_id (PK) | SERIAL / INTEGER | Unique identifier of the product |
| name | VARCHAR(255) | Name of the product |
| category_id (FK) | INTEGER | Foreign key referencing category.category_id |

### Table 2. category

| Field name | Data type | Description |
| --- | --- | --- |
| category_id (PK) | SERIAL / INTEGER | Unique identifier of the category |
| name | VARCHAR(255) | Name of the category |

### Table 3. report

| Field name | Data type | Description |
| --- | --- | --- |
| report_id (PK) | SERIAL / INTEGER | Unique identifier of the report |
| address_id (FK) | INTEGER | Foreign key referencing address.address_id |
| session_id (FK) | INTEGER | Foreign key referencing device_session.session_id |
| product_id (FK) | INTEGER | Foreign key referencing product.product_id |
| price | NUMERIC(12,2) | Submitted product price |
| photo_url | VARCHAR(255) | URL of the real-time photo in cloud storage |
| date_reported | TIMESTAMPTZ | Date and time the report was submitted |

### Table 4. srp

| Field name | Data type | Description |
| --- | --- | --- |
| srp_id (PK) | SERIAL / INTEGER | Unique identifier of the SRP record |
| product_id (FK) | INTEGER | Foreign key referencing product.product_id |
| price | NUMERIC(12,2) | Government-issued suggested retail price |
| effective_date | DATE | Date the SRP value takes effect |

### Table 5. address

| Field name | Data type | Description |
| --- | --- | --- |
| address_id (PK) | SERIAL / INTEGER | Unique identifier of the address |
| barangay | VARCHAR(255) | Barangay or town associated with the report |
| city | VARCHAR(255) | City associated with the report |
| country | VARCHAR(255) | Country associated with the report |
| longitude | NUMERIC(10,7) | Longitude of the reported location |
| latitude | NUMERIC(10,7) | Latitude of the reported location |

### Table 6. trust_rating

| Field name | Data type | Description |
| --- | --- | --- |
| trust_id (PK) | SERIAL / INTEGER | Unique identifier of the trust rating |
| report_id (FK) | INTEGER | Foreign key referencing report.report_id |
| session_id (FK) | INTEGER | Foreign key referencing device_session.session_id |
| rating | NUMERIC(3,2) | Consistency rating given to the report |
| description | VARCHAR(255) | Reason given for the rating |
| date_rated | TIMESTAMPTZ | Date and time the rating was submitted |

### Table 7. device_session

| Field name | Data type | Description |
| --- | --- | --- |
| session_id (PK) | SERIAL / INTEGER | Unique identifier of the device session |
| token | VARCHAR(255) | Anonymous token used to identify a device session |
| datetime_seen | TIMESTAMPTZ | Date and time the device session was last active |

### Table 8. device_log

| Field name | Data type | Description |
| --- | --- | --- |
| log_id (PK) | SERIAL / INTEGER | Unique identifier of the device log |
| session_id (FK) | INTEGER | Foreign key referencing device_session.session_id |
| action | VARCHAR(255) | Type of action performed by the device session |
| action_date | TIMESTAMPTZ | Date and time the action was taken, used to enforce usage limits |

## 5.5 System Architecture

Figure 6 provides an overview of the PRICETER system architecture and the interaction among the user, the Next.js application, and PostgreSQL.

The consumer accesses PRICETER through a web browser. The **React** interface, served by **Next.js**, is the primary frontend for searching products, reporting prices, rating consistency, and viewing SRP comparison, local median prices, and the price indicator. Next.js API routes or server actions handle business logic, including:

1. Report validation and photo-upload handling
2. Product search and nearby-item retrieval
3. SRP lookup and price-indicator computation
4. Local median calculation by nearby, barangay, and city scope
5. Community Trust Score aggregation
6. Anonymous device-session identification and usage-limit enforcement

A security layer maintains system integrity through HTTPS, anonymized device sessions, encrypted storage of session tokens where applicable, and enforcement of anonymity across transactions. All persistent data—product, category, address, device session, device log, report, SRP, and trust rating—is stored in **PostgreSQL**. Photos are stored in cloud object storage, with only the photo URL saved in the database. Development and deployment may use cloud infrastructure with scaling as usage grows, so the platform remains responsive and secure.

**Figure 6.** System Architecture

*(Insert Figure 6 here. Recommended layers: Browser → Next.js / React UI → Next.js API / Server Actions → PostgreSQL and Cloud Storage.)*

---

# REFERENCES

[1] Organisation for Economic Co-operation and Development (OECD), *Competition and Consumer Policy in Digital Markets*.

[2] Department of Trade and Industry (DTI), Suggested Retail Prices (SRPs) of Basic Necessities and Prime Commodities.

[3] E. Eyster, K. Madarász, and P. Michaillat, “Pricing under fairness concerns,” *Journal of the European Economic Association*, 2020.

[4] J. D. Atowan, M. Abubo, S. Devilleres, E. Lumanta, D. Pantoja, and B. Macarayo, “Dynamic pricing in clothing retail: Lived experiences from Barangay New Pandan, Panabo City retailers for business education,” *International Journal of Research Studies in Education*, vol. 14, no. 12, pp. 61–72, 2025.

[5] E. G. Trinidad, M.-L. V. Ravago, and A. M. Balisacan, “Tariff cuts without consumer gains? A competition policy perspective on Philippine price trends,” *The Philippine Review of Economics*, vol. 63, no. 1, pp. 5–42, 2026.

[6] Department of Science and Technology – Philippine Council for Agriculture, Aquatic and Natural Resources Research and Development (DOST–PCAARRD), *Philippine Rice Market Dynamics: Tackling High Retail Prices*, 2024.

[7] E. Eyster, K. Madarász, and P. Michaillat, “Pricing under fairness concerns,” *Journal of the European Economic Association*, 2020.

[8] Philippine Statistics Authority, *Price Situationer of Selected Agricultural Commodities*, 2026.

[9] Philippine Statistics Authority, *Consumer Price Index and Inflation Rate*, 2026.

[10] Food and Agriculture Organization, *Domestic Price Warnings: Philippines Rice Prices*, 2026.

[11] Department of Science and Technology – Philippine Council for Agriculture, Aquatic and Natural Resources Research and Development (DOST–PCAARRD), *Rice Industry Developments: Market Trends*, 2024.

[12] BusinessWorld, “Wholesale rice prices rise sharply,” 2026.

[13] Philippine Statistics Authority – Davao del Norte, “Davao del Norte’s inflation rate up 9.6% driven by food, transport commodities,” Apr. 2026.

[14] Department of Trade and Industry (DTI), “Consumer Space,” Department of Trade and Industry Philippines.

[15] Department of Trade and Industry – Fair Trade Enforcement Bureau (DTI–FTEB), “Surveillance and Monitoring Division,” Department of Trade and Industry Philippines.

[16] Department of Trade and Industry (DTI), “Consumer Education,” Department of Trade and Industry Philippines.

[17] Department of Trade and Industry – Fair Trade Enforcement Bureau (DTI–FTEB), “DTI, DA Chiefs inspect Quezon City market, vows nationwide price monitoring,” Jan. 18, 2025.

[18] B. G. S. Grepon, N. T. Baran, K. M. V. C. Gumonan, A. L. M. Martinez, and M. L. E. Lacsa, “Designing and implementing e-School systems: An information systems approach to school management of a community college in Northern Mindanao, Philippines,” *International Journal of Computing Sciences Research*, vol. 6, pp. 792–808, 2021.
