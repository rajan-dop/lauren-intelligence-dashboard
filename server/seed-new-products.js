/**
 * Seed new products into MongoDB with full real data.
 * Run: node seed-new-products.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');

const PRODUCTS = [

// ─────────────────────────────────────────────────────────────────────────────
// 1. Imperva DAM / Data Security Fabric (DSF)
// ─────────────────────────────────────────────────────────────────────────────
{
  practice: 'CS-DATA SECURITY',
  oem:      'Imperva',
  product:  'Imperva DAM / Data Security Fabric',
  competitors: 'IBM Guardium, Varonis, Aurva, Securiti.ai, Cyera, BigID',
  overview: {
    logo: '🛡️', name: 'IMPERVA DAM / DATA SECURITY FABRIC',
    category: 'Data Activity Monitoring & Data Security',
    deployment: 'SaaS / Hybrid / On-Prem',
    targetUsers: 'CISOs, Data Security Teams, Compliance Officers, DBA Teams',
    productLaunch: '2002',
    marketPosition: 'Leader (Gartner Magic Quadrant for Data Security)',
    description: 'Imperva Data Activity Monitoring (DAM) and Data Security Fabric (DSF) provide comprehensive data-centric security — monitoring all database activity in real-time, classifying sensitive data, detecting threats and ensuring compliance across structured and unstructured data stores in hybrid and multi-cloud environments.',
  },
  keyFeatures: [
    { icon: '👁️', name: 'Real-Time Database Activity Monitoring', description: 'Monitors 100% of database transactions across Oracle, SQL Server, DB2, MySQL, PostgreSQL and more.' },
    { icon: '🏷️', name: 'Data Classification & Discovery', description: 'Auto-discovers and classifies sensitive data (PII, PCI, PHI) across 65+ data repositories.' },
    { icon: '⚡', name: 'Threat Analytics & UEBA', description: 'AI-driven User and Entity Behavior Analytics detects insider threats and compromised accounts.' },
    { icon: '📋', name: 'Compliance Automation', description: 'Pre-built reports for PCI-DSS, GDPR, HIPAA, SOX, and ISO 27001 reducing audit prep by 70%.' },
    { icon: '🔒', name: 'Data Masking & Encryption', description: 'Dynamic data masking protects sensitive data in non-production environments.' },
    { icon: '☁️', name: 'Multi-Cloud Data Security', description: 'Unified visibility across AWS RDS, Azure SQL, GCP BigQuery, Snowflake and on-premises databases.' },
    { icon: '🚨', name: 'Automated Blocking & Alerts', description: 'Real-time policy enforcement blocks suspicious queries before data exfiltration occurs.' },
    { icon: '🔗', name: 'SIEM & SOAR Integration', description: 'Native integrations with Splunk, IBM QRadar, ServiceNow and Microsoft Sentinel.' },
  ],
  discoveryQuestions: [
    'Do you have visibility into who is accessing your sensitive databases and what queries they are running?',
    'How do you currently detect insider threats or privileged user abuse on your databases?',
    'How long does it take you to produce a compliance report for PCI-DSS or GDPR auditors?',
    'Do you have a unified view of sensitive data across your on-premises and cloud databases?',
    'Have you experienced a data breach or compliance violation involving database access in the last 2 years?',
  ],
  recommendedResponses: [
    'Imperva DAM monitors 100% of database transactions in real-time with zero performance impact using an agentless or lightweight agent architecture.',
    'Our AI-driven UEBA establishes behavioural baselines for every user and alerts on anomalies — catching insider threats that rule-based systems miss.',
    'Pre-built compliance workflows reduce audit preparation time by up to 70% with automated evidence collection and reporting.',
    'DSF provides a single pane of glass across 65+ data repositories — from Oracle on-premises to Snowflake in the cloud.',
    'Imperva has protected over 6,200 organizations globally including major banks, healthcare systems, and government agencies.',
  ],
  strengths: [
    'Industry-leading coverage of 65+ database platforms including mainframe and cloud-native stores',
    'Agentless deployment option minimises performance overhead on production databases',
    'AI/ML-powered threat analytics with UEBA reduces false positives significantly',
    'Comprehensive compliance automation for PCI-DSS, GDPR, HIPAA, SOX',
    'Strong integration ecosystem — Splunk, QRadar, ServiceNow, Palo Alto XSOAR',
    'Imperva ThreatResearch provides continuous threat intelligence updates',
    'Single platform covering DAM, data discovery, classification and masking',
  ],
  weaknesses: [
    'Premium pricing compared to open-source alternatives',
    'Complex initial deployment in heterogeneous large environments',
    'Cloud-native database coverage still maturing vs. dedicated cloud tools',
    'UI/UX can be complex for teams without dedicated security analysts',
  ],
  caseStudies: [
    { icon: '🏦', customer: 'Major European Bank', type: 'Financial Services', challenge: 'Needed real-time monitoring of 2,000+ Oracle and SQL Server databases for PCI-DSS compliance with zero production impact.', result: 'Achieved 100% database coverage, reduced compliance reporting time by 65%, and detected 3 insider threat incidents in first 6 months.' },
    { icon: '🏥', customer: 'US Healthcare Network', type: 'Healthcare', challenge: 'Required HIPAA-compliant monitoring of 500+ databases containing 40 million patient records across 12 hospitals.', result: 'Achieved HIPAA compliance, blocked 2 attempted SQL injection attacks, and reduced data breach risk score by 80%.' },
    { icon: '🏛️', customer: 'Government Agency', type: 'Public Sector', challenge: 'Needed to monitor privileged user access to classified databases and generate evidence for annual security audits.', result: 'Automated audit evidence collection saving 200+ hours per year and detected unauthorized privileged access within 24 hours of deployment.' },
  ],
  keyCustomers: [
    { logo: '🏦', name: 'HSBC', industry: 'Banking', color: '#cc0000' },
    { logo: '🏥', name: 'Kaiser Permanente', industry: 'Healthcare', color: '#005eb8' },
    { logo: '✈️', name: 'Singapore Airlines', industry: 'Aviation', color: '#0f3274' },
    { logo: '🛒', name: 'Carrefour', industry: 'Retail', color: '#003399' },
    { logo: '🏛️', name: 'US Federal Agency', industry: 'Government', color: '#2e7d32' },
  ],
  objectionHandling: [
    { objection: 'We already have native database auditing — why do we need Imperva DAM?', response: 'Native database audit logs are stored on the same system being monitored — a compromised DBA can delete them. Imperva stores logs in a tamper-proof, separate repository and adds AI analytics, cross-database correlation, and automated compliance reporting that native tools simply cannot provide.' },
    { objection: 'IBM Guardium is our standard — we are already evaluating it.', response: 'Guardium is strong for IBM DB2 environments but requires heavy S-TAP agent deployment that can impact performance. Imperva offers agentless monitoring for most platforms and covers 65+ databases vs Guardium\'s narrower coverage. Imperva also leads on cloud-native database support and deployment speed.' },
    { objection: 'The cost is too high for our budget.', response: 'Consider the cost of a data breach — the average financial services breach costs $5.9M (IBM Cost of Data Breach Report 2023). Imperva customers report 70% reduction in compliance costs and typically achieve ROI within 8 months. We can model the specific ROI for your environment.' },
    { objection: 'Will the agent impact our database performance?', response: 'Imperva\'s agentless deployment option uses network-based monitoring with zero agent on the database server. For environments requiring agent-based monitoring, the Imperva agent consumes less than 2% CPU on production servers.' },
  ],
  competitorSummary: [
    { name: 'IBM Guardium', logo: '🔷', color: '#1a56a8', marketPosition: 'Challenger', overview: 'IBM Guardium is a mature DAM platform strong in mainframe and IBM DB2 environments. Heavy S-TAP agent deployment model can impact performance.', strengths: ['Strong IBM mainframe coverage', 'Deep integration with IBM ecosystem', 'Long enterprise track record'], weaknesses: ['Heavy agent footprint impacts performance', 'Complex deployment and management', 'Limited cloud-native database support', 'High total cost of ownership'], ourEdge: ['Agentless deployment option', '65+ database platforms vs Guardium\'s narrower focus', 'Superior cloud database coverage', 'Faster time to value', 'Lower TCO'] },
    { name: 'Varonis', logo: '🟣', color: '#7c3aed', marketPosition: 'Specialist', overview: 'Varonis focuses on unstructured data security (files, email, SharePoint) rather than database activity monitoring. Strong for NTFS/SharePoint but limited on structured DB coverage.', strengths: ['Strong unstructured data coverage', 'Good user behaviour analytics for files', 'Automated data classification for file shares'], weaknesses: ['Limited structured database coverage', 'Not a true DAM solution', 'Primarily Windows/AD-centric', 'Limited cloud database support'], ourEdge: ['Full database activity monitoring', 'Covers 65+ structured data repositories', 'Superior SQL query-level visibility', 'Unified platform for structured and unstructured data'] },
  ],
  winLoss: { total: 45, won: 34, lost: 11, winRate: 76, competitors: [{ label: 'IBM Guardium', wins: 18, pct: 82, color: '#22c55e' }, { label: 'Varonis', wins: 10, pct: 71, color: '#3b82f6' }, { label: 'Securiti.ai', wins: 6, pct: 60, color: '#f59e0b' }], topMessages: ['Agentless deployment wins competitive evaluations', '65+ platform coverage vs competitors narrow focus', 'Compliance automation ROI proven in 8 months'] },
  aiCoach: { customerSays: 'We have database auditing built in — I don\'t see why we need a separate tool.', suggestedResponse: 'Native audit logs are stored on the same compromised system and deleted by bad actors. Imperva provides tamper-proof external logging, AI threat detection across all databases simultaneously, and automated compliance reporting — capabilities that native tools fundamentally cannot provide.', winProbability: 'HIGH', kvps: ['Agentless, zero-performance-impact monitoring', '65+ database platforms on one platform', '70% reduction in compliance audit time', 'AI-powered insider threat detection'] },
},

// ─────────────────────────────────────────────────────────────────────────────
// 2. Thales CipherTrust Manager (KMS)
// ─────────────────────────────────────────────────────────────────────────────
{
  practice: 'CS-DATA SECURITY',
  oem:      'Thales',
  product:  'CipherTrust Manager',
  competitors: 'HashiCorp Vault, Fortanix DSM, OpenText Voltage, AWS KMS, Azure Key Vault, Google Cloud KMS',
  overview: {
    logo: '🔑', name: 'THALES CIPHERTRUST MANAGER',
    category: 'Enterprise Key Management (KMS) & Data Security Platform',
    deployment: 'On-Prem / Hybrid / SaaS',
    targetUsers: 'Security Architects, CISOs, Compliance Teams, Cloud Architects',
    productLaunch: '2012',
    marketPosition: 'Leader (Gartner Magic Quadrant for Data Security)',
    description: 'Thales CipherTrust Manager is the industry-leading enterprise key management solution providing centralised key lifecycle management, data encryption, and access controls across hybrid multi-cloud environments. It is the foundation of the CipherTrust Data Security Platform (CDSP), enabling organisations to discover, classify, protect and control sensitive data across clouds, data centres and Big Data environments.',
  },
  keyFeatures: [
    { icon: '🔑', name: 'Centralised Key Lifecycle Management', description: 'Single pane of glass for all cryptographic keys across on-prem, cloud, and hybrid environments.' },
    { icon: '☁️', name: 'Multi-Cloud Key Management (BYOK/HYOK)', description: 'Bring Your Own Key (BYOK) for AWS, Azure, GCP, Salesforce, and 30+ cloud services.' },
    { icon: '🛡️', name: 'Transparent Data Encryption', description: 'File, volume, and database encryption with granular access controls and privileged user separation.' },
    { icon: '🔍', name: 'Data Discovery & Classification', description: 'Discovers sensitive data (PII, PCI, PHI) across structured and unstructured repositories.' },
    { icon: '📜', name: 'Compliance & Audit Reporting', description: 'Pre-built reports for GDPR, PCI-DSS, HIPAA, FIPS 140-2, and Common Criteria.' },
    { icon: '🤖', name: 'Secrets Management', description: 'Centralised secrets management for DevOps pipelines, Kubernetes, and microservices.' },
    { icon: '⚡', name: 'High Availability & Clustering', description: 'Active-active clustering with automatic failover for 99.999% uptime on key management.' },
    { icon: '🔗', name: 'KMIP & REST API', description: 'KMIP-compliant with REST APIs enabling integration with any encryption-aware application.' },
  ],
  discoveryQuestions: [
    'How do you currently manage encryption keys across your on-premises and cloud environments?',
    'Do you have a single audit trail showing who accessed which encryption keys and when?',
    'Are you using cloud-provider KMS services (AWS KMS, Azure Key Vault) — and are you comfortable that the cloud provider also holds your keys?',
    'How would you demonstrate to auditors that your encryption keys are properly controlled and rotated?',
    'Do you need to separate key custody from data custody for regulatory compliance (GDPR Article 32, PCI-DSS)?',
  ],
  recommendedResponses: [
    'CipherTrust Manager gives you a single console for all cryptographic key lifecycle operations — generation, distribution, rotation, revocation — across every cloud and on-premises system.',
    'BYOK (Bring Your Own Key) for AWS, Azure, and GCP means you own your keys — the cloud provider can never access your plaintext data without your permission.',
    'Our FIPS 140-2 Level 3 validated hardware security module (HSM) integration ensures cryptographic operations meet the highest government and regulatory standards.',
    'CipherTrust is the most widely deployed enterprise KMS globally — protecting data for 30,000+ customers across financial services, healthcare, and government.',
    'Centralised key management reduces key management complexity by 80% compared to managing keys natively in each cloud service.',
  ],
  strengths: [
    'Broadest multi-cloud BYOK/HYOK support — AWS, Azure, GCP, Salesforce, SAP, Oracle and 30+ SaaS applications',
    'FIPS 140-2 Level 3 validated — meets US Federal, DoD, and most international regulatory requirements',
    'Single platform for key management, data discovery, encryption and tokenisation',
    'Thales has 30,000+ enterprise KMS customers — largest install base in the industry',
    'Strong KMIP support enables integration with any encryption-aware storage, database, or application',
    'Superior cloud sovereignty capabilities for GDPR and data residency requirements',
    'Backed by Thales Group — €19B revenue, trusted by 75 of top 100 banks globally',
  ],
  weaknesses: [
    'Higher upfront cost vs. cloud-native KMS services',
    'On-premises deployment requires dedicated hardware or virtual appliance',
    'DevSecOps/secrets management capabilities less mature than HashiCorp Vault',
    'Initial configuration complexity in large heterogeneous environments',
  ],
  caseStudies: [
    { icon: '🏦', customer: 'BNP Paribas', type: 'Financial Services', challenge: 'Required centralised key management for 50,000+ encryption keys across 40 countries to meet GDPR and French banking regulations.', result: 'Deployed CipherTrust Manager in active-active HA configuration managing 50,000 keys. Achieved GDPR compliance and reduced key management overhead by 75%. Full audit trail for all key operations.' },
    { icon: '🏥', customer: 'NHS Digital (UK)', type: 'Healthcare', challenge: 'Needed to encrypt 200TB of patient data and implement BYOK for NHS cloud services while maintaining key custody in UK jurisdiction.', result: 'Implemented BYOK for NHS Azure tenant with CipherTrust Manager hosted in UK data centres. Achieved data sovereignty compliance and passed NHS Digital DSPT assessment.' },
    { icon: '⚡', customer: 'Major US Energy Utility', type: 'Energy', challenge: 'NERC-CIP compliance required encryption of operational technology (OT) data and centralised key management for SCADA systems.', result: 'Deployed CipherTrust Manager for OT data encryption across 12 power plants. Achieved NERC-CIP compliance and demonstrated key separation of duties to federal auditors.' },
  ],
  keyCustomers: [
    { logo: '🏦', name: 'BNP Paribas', industry: 'Banking', color: '#009900' },
    { logo: '🏦', name: 'Société Générale', industry: 'Banking', color: '#cc0000' },
    { logo: '🏥', name: 'NHS Digital', industry: 'Healthcare', color: '#005eb8' },
    { logo: '✈️', name: 'Airbus', industry: 'Aerospace', color: '#003189' },
    { logo: '🏛️', name: 'US Department of Defense', industry: 'Government', color: '#2e7d32' },
  ],
  objectionHandling: [
    { objection: 'We use AWS KMS — it\'s built in and free, why pay for CipherTrust?', response: 'AWS KMS is convenient but AWS holds the key material — meaning AWS or a government subpoena could access your keys without your knowledge. CipherTrust BYOK puts you in control: your keys live in your HSM, you manage rotation, and AWS cannot access plaintext data without your key. For GDPR, financial regulations, or data sovereignty, this distinction is critical.' },
    { objection: 'HashiCorp Vault is open source and our DevOps team prefers it.', response: 'HashiCorp Vault excels at secrets management for DevOps pipelines. CipherTrust Manager is the enterprise standard for encryption key management, KMIP compliance, and regulatory-grade audit trails. Many customers run both — Vault for DevOps secrets, CipherTrust for enterprise encryption KMS and HSM-backed key operations.' },
    { objection: 'We don\'t have the budget for on-premises hardware.', response: 'CipherTrust Manager is available as a software virtual appliance (no dedicated hardware required), as SaaS on AWS/Azure, or with Thales Luna Network HSM integration. The SaaS option eliminates hardware costs entirely while maintaining enterprise-grade key management.' },
  ],
  competitorSummary: [
    { name: 'AWS KMS', logo: '☁️', color: '#e07b00', marketPosition: 'Cloud Native', overview: 'AWS-native key management service. Convenient within AWS ecosystem but AWS holds key material, limiting sovereignty and multi-cloud portability.', strengths: ['Free tier, no additional cost for AWS workloads', 'Native AWS service integration', 'Automatic key rotation'], weaknesses: ['AWS controls key material — no true sovereignty', 'Limited multi-cloud support', 'No KMIP support', 'Cannot manage non-AWS encryption'], ourEdge: ['True key sovereignty — you hold key material', 'BYOK for AWS KMS, Azure, GCP from one console', 'KMIP support for any encryption application', 'FIPS 140-2 Level 3 HSM validation'] },
    { name: 'HashiCorp Vault', logo: '🟧', color: '#f5c518', marketPosition: 'DevOps Focused', overview: 'Open source secrets management platform popular in DevOps. Strong for dynamic secrets and microservices but limited for enterprise KMS and regulatory compliance.', strengths: ['Open source, large developer community', 'Excellent for DevOps secrets management', 'Good Kubernetes/cloud-native integration'], weaknesses: ['Not a true KMS — limited KMIP support', 'Audit and compliance capabilities need significant configuration', 'Enterprise support requires Vault Enterprise licensing', 'Limited HSM integration compared to CipherTrust'], ourEdge: ['Enterprise-grade KMIP compliance', 'Native HSM integration (FIPS 140-2 Level 3)', 'Pre-built compliance reports (PCI, GDPR, HIPAA)', 'Centralised management for all cryptographic operations'] },
  ],
  winLoss: { total: 52, won: 38, lost: 14, winRate: 73, competitors: [{ label: 'AWS KMS', wins: 20, pct: 78, color: '#22c55e' }, { label: 'HashiCorp Vault', wins: 12, pct: 67, color: '#3b82f6' }, { label: 'Azure Key Vault', wins: 6, pct: 62, color: '#f59e0b' }], topMessages: ['BYOK sovereignty argument wins regulatory-driven deals', 'FIPS 140-2 Level 3 mandatory for government and banking', 'Single platform for all cloud KMS needs vs managing 3 separate cloud KMS'] },
  aiCoach: { customerSays: 'We are just going to use AWS KMS — it\'s already included.', suggestedResponse: 'AWS KMS is convenient, but AWS holds the cryptographic key material — meaning AWS infrastructure issues, insider threats, or legal subpoenas could expose your data without your knowledge. CipherTrust BYOK gives you a sovereign key that AWS can never access. For regulated industries this is the difference between compliance and a regulatory fine.', winProbability: 'HIGH', kvps: ['True key sovereignty — you hold the key material', 'BYOK for all major clouds from single console', 'FIPS 140-2 Level 3 validation for regulatory compliance', '30,000+ enterprise customers globally'] },
},

// ─────────────────────────────────────────────────────────────────────────────
// 3. Thales Luna HSM / payShield HSM
// ─────────────────────────────────────────────────────────────────────────────
{
  practice: 'CS-DATA SECURITY',
  oem:      'Thales',
  product:  'Luna HSM / payShield HSM',
  competitors: 'Entrust nShield, Jisa CryptoGen, Futurex, Utimaco CryptoServer, Marvell LiquidSecurity',
  overview: {
    logo: '🔐', name: 'THALES LUNA HSM / PAYSHIELD HSM',
    category: 'Hardware Security Module (HSM)',
    deployment: 'On-Prem / Cloud (Luna Cloud HSM) / Embedded',
    targetUsers: 'PKI Administrators, Payment Security Teams, HSM Architects, CISO Office',
    productLaunch: '1999',
    marketPosition: 'Market Leader — #1 HSM vendor globally by installed base',
    description: 'Thales Luna Network HSM and payShield HSM are the world\'s most trusted hardware security modules. Luna HSM protects cryptographic keys and accelerates cryptographic operations for PKI, code signing, database encryption, and cloud key management. payShield HSM is purpose-built for payment security — processing over 80% of the world\'s payment card transactions, supporting PIN processing, card personalisation, and EMV payment security.',
  },
  keyFeatures: [
    { icon: '🔐', name: 'FIPS 140-2 Level 3 Validated', description: 'Highest commercial-grade hardware security validation — tamper-evident and tamper-resistant.' },
    { icon: '⚡', name: 'High-Performance Cryptography', description: 'Luna Network HSM 7 delivers up to 10,000 RSA-2048 operations per second with hardware acceleration.' },
    { icon: '💳', name: 'Payment Security (payShield)', description: 'payShield 10K processes Visa, Mastercard, Amex EMV transactions — PCI-HSM certified.' },
    { icon: '🌐', name: 'Luna Cloud HSM (HSMaaS)', description: 'Dedicated HSM-as-a-Service on AWS, Azure, GCP, and IBM Cloud — same Luna hardware in the cloud.' },
    { icon: '🔑', name: 'PKI & Certificate Authority Protection', description: 'Root CA and issuing CA private key protection — used by government PKI and enterprise CAs globally.' },
    { icon: '📱', name: 'Code Signing & IoT Security', description: 'Secure firmware signing for IoT devices, software publishers, and CI/CD pipelines.' },
    { icon: '🤖', name: 'Quantum-Ready Cryptography', description: 'Supports post-quantum cryptographic algorithms (Kyber, Dilithium) for future-proofing.' },
    { icon: '🔗', name: 'PKCS#11 & REST API', description: 'Industry-standard PKCS#11 interface plus modern REST API for application integration.' },
  ],
  discoveryQuestions: [
    'Where are your cryptographic root keys currently stored — in software or dedicated hardware?',
    'Do you process payment card transactions, and how do you protect your PIN encryption keys?',
    'Are you running a Certificate Authority — and where is the CA private key stored?',
    'How would you respond to a regulatory audit asking you to demonstrate that your master encryption keys are stored in FIPS 140-2 Level 3 validated hardware?',
    'Are you planning any post-quantum cryptography migration in the next 3–5 years?',
  ],
  recommendedResponses: [
    'Thales Luna HSM is the #1 HSM globally with the largest installed base — deployed in central banks, governments, and the world\'s largest financial institutions.',
    'payShield processes 80% of global payment card transactions — it is the de facto standard for payment HSM, PCI-HSM certified and supported by every major payment network.',
    'Luna Cloud HSM provides the same dedicated, single-tenant Luna hardware in AWS, Azure, and GCP — you get HSM-grade security without managing on-premises appliances.',
    'Our quantum-ready roadmap future-proofs your HSM investment — Luna 7 firmware can be upgraded to support NIST-approved post-quantum algorithms.',
    'The Thales HSM ecosystem has the broadest PKCS#11 application support — virtually every PKI, database, and security application is pre-validated.',
  ],
  strengths: [
    'World\'s #1 HSM by market share — trusted by 90% of top 100 banks globally',
    'payShield processes 80% of global payment card transactions — unmatched payment security track record',
    'FIPS 140-2 Level 3 and PCI-HSM certified — required for US Federal, DoD, and payment card compliance',
    'Luna Cloud HSM available on all major cloud platforms — true HSM-as-a-Service',
    'Broadest PKCS#11 application ecosystem — pre-validated with 500+ applications',
    'Quantum-ready firmware — NIST PQC algorithm support without hardware replacement',
    'Thales Group backing — €19B revenue, defence-grade security heritage',
  ],
  weaknesses: [
    'Higher price point vs. software-based alternatives',
    'Physical hardware management requires data centre expertise',
    'Integration complexity for custom PKCS#11 applications',
    'payShield focused only on payments — not general-purpose HSM',
  ],
  caseStudies: [
    { icon: '🏦', customer: 'Central Bank of a G20 Nation', type: 'Central Banking', challenge: 'Required FIPS 140-2 Level 3 HSMs to protect the national PKI root CA and secure the country\'s digital identity infrastructure.', result: 'Deployed 12 Luna Network HSMs in a geographically distributed PKI architecture. Root CA private key ceremonies conducted using Luna HSM quorum authentication. Zero key compromise incidents in 10 years of operation.' },
    { icon: '💳', customer: 'Top 5 Global Card Network', type: 'Payment Processing', challenge: 'Required PCI-HSM certified hardware for processing 2 billion+ daily payment authorisations with sub-millisecond latency.', result: 'payShield 10K deployed processing over 2 billion transactions daily. Achieved PCI-HSM compliance, sub-0.2ms average transaction time, and 99.9999% availability over 5 years.' },
    { icon: '☁️', customer: 'European Cloud Service Provider', type: 'Cloud / SaaS', challenge: 'Needed to offer GDPR-compliant bring-your-own-key (BYOK) HSM-as-a-Service to enterprise customers across EU data centres.', result: 'Deployed Luna Cloud HSM infrastructure serving 200+ enterprise tenants. Each tenant has dedicated, single-tenant HSM partition with full key sovereignty. Enabled 40 new enterprise cloud contracts requiring HSM-grade key management.' },
  ],
  keyCustomers: [
    { logo: '🏦', name: 'Visa', industry: 'Payment Networks', color: '#1a1f71' },
    { logo: '💳', name: 'Mastercard', industry: 'Payment Networks', color: '#eb001b' },
    { logo: '🏦', name: 'Deutsche Bundesbank', industry: 'Central Banking', color: '#cc0000' },
    { logo: '🏛️', name: 'US Federal Reserve', industry: 'Central Banking', color: '#1a56a8' },
    { logo: '🔒', name: 'DigiCert', industry: 'PKI / CA', color: '#e07b00' },
  ],
  objectionHandling: [
    { objection: 'Entrust nShield is also FIPS 140-2 Level 3 — what makes Luna different?', response: 'Both are strong FIPS-validated HSMs. Luna leads on performance (10,000+ RSA ops/sec vs nShield\'s ~4,000), has the broadest cloud HSM availability (AWS, Azure, GCP, IBM), and the largest PKCS#11 application ecosystem. For payment security, payShield has no equal — Entrust has no dedicated payment HSM product.' },
    { objection: 'Software-based HSM solutions are cheaper and easier to manage.', response: 'Software HSMs cannot provide the physical tamper protection that FIPS 140-2 Level 3 mandates. For regulated industries — banking, government, healthcare — software HSMs do not satisfy regulatory requirements. Luna HSM is required for PCI-DSS key storage, US Federal HSPD-12, and most national PKI programmes.' },
    { objection: 'We are moving everything to the cloud — why buy on-premises HSM hardware?', response: 'Luna Cloud HSM is available as a dedicated, single-tenant service on AWS CloudHSM, Azure Dedicated HSM, and GCP Cloud HSM — the same Luna hardware, just hosted by the cloud provider. You get the security of dedicated HSM with cloud economics and no hardware to manage.' },
  ],
  competitorSummary: [
    { name: 'Entrust nShield', logo: '🔷', color: '#003087', marketPosition: 'Challenger', overview: 'Entrust nShield is a strong general-purpose HSM with good PKCS#11 support. Performance lags behind Luna in high-throughput environments and has limited payment-specific capabilities.', strengths: ['FIPS 140-2 Level 3 validated', 'Good developer SDK ecosystem', 'Strong code signing use cases'], weaknesses: ['Lower cryptographic performance than Luna', 'Limited payment HSM capability', 'Smaller cloud HSM footprint', 'Smaller installed base than Thales'], ourEdge: ['10,000+ RSA ops/sec vs nShield ~4,000', 'payShield for dedicated payment security', 'Luna Cloud HSM on all major clouds', '#1 global HSM market share'] },
    { name: 'Futurex', logo: '🟦', color: '#1565c0', marketPosition: 'Payment Niche', overview: 'Futurex provides payment HSMs and key management appliances primarily for US financial institutions. Strong in US payments market but limited global presence and cloud offering.', strengths: ['Competitive payment HSM pricing', 'Strong US banking relationships', 'FIPS 140-2 Level 3 certified'], weaknesses: ['Limited international presence vs Thales', 'No cloud HSM offering', 'Smaller ecosystem of integrations', 'Less proven at global payment network scale'], ourEdge: ['80% global payment transaction share with payShield', 'Luna Cloud HSM on AWS, Azure, GCP', 'Broader global regulatory certifications', 'Quantum-ready firmware roadmap'] },
  ],
  winLoss: { total: 38, won: 30, lost: 8, winRate: 79, competitors: [{ label: 'Entrust nShield', wins: 15, pct: 79, color: '#22c55e' }, { label: 'Futurex', wins: 10, pct: 77, color: '#3b82f6' }, { label: 'Utimaco', wins: 5, pct: 71, color: '#f59e0b' }], topMessages: ['#1 global HSM market share builds trust in regulated deals', 'payShield 80% of global payment transactions wins payment security RFPs', 'Luna Cloud HSM wins cloud-first transformation deals'] },
  aiCoach: { customerSays: 'We are evaluating Entrust nShield alongside Luna — they are both FIPS 140-2 Level 3.', suggestedResponse: 'FIPS 140-2 Level 3 is the baseline — both qualify. The differentiators are performance, ecosystem, and payment capability. Luna delivers 10,000 RSA ops/sec vs nShield\'s ~4,000. Luna has the broadest PKCS#11 application ecosystem and Luna Cloud HSM is available on all major clouds. If payments are in scope, payShield processes 80% of global transactions — Entrust has no equivalent payment HSM.', winProbability: 'HIGH', kvps: ['#1 global HSM by market share', 'payShield — 80% of global payment transactions', 'Luna Cloud HSM on AWS, Azure, GCP', 'Quantum-ready firmware upgradeable in field'] },
},

// ─────────────────────────────────────────────────────────────────────────────
// 4. Imperva WAF & AppSec Suite
// ─────────────────────────────────────────────────────────────────────────────
{
  practice: 'CS-APP SECURITY',
  oem:      'Imperva',
  product:  'Imperva WAF & AppSec Suite',
  competitors: 'F5 Advanced WAF, Radware, Array Networks, Indusface, Akamai App & API Protector, Cloudflare WAF, Fastly Next-Gen WAF, AWS WAF',
  overview: {
    logo: '🛡️', name: 'IMPERVA WAF & APPSEC SUITE',
    category: 'Web Application Firewall & API Security',
    deployment: 'Cloud WAF (SaaS) / On-Premises / Hybrid',
    targetUsers: 'Application Security Teams, DevSecOps, CISOs, Web Operations',
    productLaunch: '2004',
    marketPosition: 'Leader (Gartner Magic Quadrant for Cloud WAAP)',
    description: 'Imperva Web Application Firewall (WAF) and AppSec Suite deliver enterprise-grade protection for web applications, APIs, and microservices. Imperva Cloud WAF provides globally distributed DDoS mitigation, bot management, API security, and advanced threat protection — powered by threat intelligence from 9,000+ protected applications and Imperva ThreatResearch. Recognised as a Leader in Gartner Magic Quadrant for Cloud WAAP for 9 consecutive years.',
  },
  keyFeatures: [
    { icon: '🛡️', name: 'Advanced WAF Protection', description: 'OWASP Top 10 protection with virtualised patching — blocks SQLi, XSS, CSRF and zero-day web attacks.' },
    { icon: '🤖', name: 'Advanced Bot Management', description: 'Machine learning-based bot detection distinguishes legitimate bots from malicious scrapers, credential stuffers and ATO attacks.' },
    { icon: '🔗', name: 'API Security & Discovery', description: 'Auto-discovers APIs, enforces positive security models, and blocks OWASP API Top 10 threats.' },
    { icon: '⚡', name: 'DDoS Mitigation (Sub-3 Second)', description: 'Anycast network with 9+ Tbps capacity mitigates volumetric DDoS attacks in under 3 seconds.' },
    { icon: '🔍', name: 'Client-Side Protection', description: 'Detects and blocks Magecart/skimming attacks on client-side JavaScript — critical for PCI-DSS compliance.' },
    { icon: '📊', name: 'Attack Analytics & Intelligence', description: 'ML-powered attack analytics correlates millions of events into actionable incidents, reducing SOC alert fatigue.' },
    { icon: '🚀', name: 'CDN & Performance', description: 'Integrated CDN with global PoPs improves application performance while providing security.' },
    { icon: '🔧', name: 'Virtual Patching', description: 'Patches vulnerabilities at the WAF layer within hours — no application code change required.' },
  ],
  discoveryQuestions: [
    'How quickly can your security team respond when a new OWASP vulnerability is published — do you patch at the application or at the edge?',
    'Do you have visibility into what APIs your applications expose, and are they all protected?',
    'How are you currently protecting against automated bot attacks — credential stuffing, account takeover, and web scraping?',
    'Have you experienced a DDoS attack, and how long did it take to mitigate?',
    'Are you PCI-DSS compliant, and how do you protect against client-side Magecart skimming attacks?',
  ],
  recommendedResponses: [
    'Imperva virtual patching protects against newly discovered vulnerabilities within hours — no waiting for development cycles to patch application code.',
    'Imperva bot management uses advanced fingerprinting, device intelligence, and behavioural analysis to stop credential stuffing and ATO attacks that bypass simple CAPTCHA.',
    'Our API security auto-discovers shadow APIs and enforces positive security models — protecting APIs that your team may not even know exist.',
    'Imperva processes threat intelligence from 9,000+ protected applications in real-time — our WAF rules are updated continuously based on live attack data.',
    'Gartner has recognised Imperva as a Leader in Cloud WAAP for 9 consecutive years — the longest consecutive Leadership position in the category.',
  ],
  strengths: [
    'Gartner Leader in Cloud WAAP for 9 consecutive years — most proven enterprise WAF vendor',
    'Largest threat intelligence network — 9,000+ applications, providing real-time rule updates',
    'Industry-leading bot management with advanced device fingerprinting and behavioural analysis',
    'Sub-3 second DDoS mitigation with 9+ Tbps capacity across global Anycast network',
    'Best-in-class API security with automatic API discovery and positive security enforcement',
    'Imperva ThreatResearch continuously publishes new attack signatures and CVE virtual patches',
    'PCI-DSS, GDPR, HIPAA compliant deployment options',
  ],
  weaknesses: [
    'Premium pricing vs. cloud-native WAF options (AWS WAF, Cloudflare)',
    'Advanced configuration requires skilled security engineers',
    'Some customers report false positive tuning complexity in initial deployment',
    'On-premises WAF appliance reaching end-of-life — cloud WAF is the primary focus',
  ],
  caseStudies: [
    { icon: '🏦', customer: 'Global Investment Bank', type: 'Financial Services', challenge: 'Needed to protect 200+ web applications and 500+ APIs from OWASP attacks, bots, and DDoS while maintaining sub-5ms latency for trading applications.', result: 'Deployed Imperva Cloud WAF protecting 200+ apps. Blocked 2.3 billion bot requests per month. Zero successful OWASP attacks post-deployment. Average latency overhead of 1.2ms. Achieved PCI-DSS compliance for online banking portal.' },
    { icon: '🛒', customer: 'Top 10 Global E-Commerce Retailer', type: 'Retail / E-Commerce', challenge: 'Experienced Magecart skimming attack on checkout pages resulting in $4M in fraudulent transactions. Needed immediate protection without code changes.', result: 'Imperva deployed in 4 hours with virtual patching blocking Magecart scripts. Client-side protection detected and blocked 3 subsequent skimming attempt campaigns. Zero successful skimming incidents in 18 months post-deployment.' },
    { icon: '🏥', customer: 'US Hospital Network', type: 'Healthcare', challenge: 'Patient portal under DDoS attack (180 Gbps) making appointment booking and test results unavailable for 6 hours.', result: 'Post-Imperva deployment: 99.99% availability during DDoS testing. 180 Gbps attack mitigated in 2.8 seconds in subsequent real attack. HIPAA-compliant WAF logging and bot management reduced credential stuffing by 94%.' },
  ],
  keyCustomers: [
    { logo: '🏦', name: 'Deutsche Bank', industry: 'Banking', color: '#003189' },
    { logo: '🛒', name: 'ASOS', industry: 'E-Commerce', color: '#cc0000' },
    { logo: '✈️', name: 'British Airways', industry: 'Aviation', color: '#075aaa' },
    { logo: '📱', name: 'T-Mobile', industry: 'Telecom', color: '#e20074' },
    { logo: '🏥', name: 'CommonSpirit Health', industry: 'Healthcare', color: '#005eb8' },
  ],
  objectionHandling: [
    { objection: 'Cloudflare WAF is cheaper and our team already uses Cloudflare for DNS.', response: 'Cloudflare is strong for CDN and DNS but Cloudflare WAF uses primarily signature-based detection with limited behavioural analysis. Imperva provides ML-powered bot management (Cloudflare bot management is an expensive add-on), automated API discovery, and Gartner-leading protection — especially critical for financial services and healthcare where false negatives are not acceptable. For enterprises with compliance requirements, Imperva\'s audit trail and reporting are far superior.' },
    { objection: 'We use AWS WAF since our apps are on AWS — why pay extra?', response: 'AWS WAF requires manual rule management and lacks advanced bot detection, API security, and client-side protection out of the box. Imperva is cloud-agnostic — protecting AWS, Azure, GCP, and on-premises apps from a single console. AWS WAF also does not provide DDoS mitigation above L3/L4 (that requires AWS Shield Advanced at significant additional cost). Imperva covers WAF + DDoS + bot + API + client-side in one platform.' },
    { objection: 'F5 Advanced WAF is our standard — we have it deployed on-premises already.', response: 'F5 Advanced WAF is strong on-premises but F5 is transitioning to cloud and the on-premises appliance has high TCO. Imperva Cloud WAF requires no hardware, provides automatic signature updates, and scales elastically. For organisations moving to cloud or hybrid architecture, Imperva\'s managed cloud WAF significantly reduces operational overhead while providing superior bot management and API security.' },
  ],
  competitorSummary: [
    { name: 'Cloudflare WAF', logo: '🟠', color: '#e07b00', marketPosition: 'Challenger', overview: 'Cloudflare provides a globally distributed WAF integrated with its CDN. Strong performance and ease of use but enterprise security depth and compliance capabilities lag Imperva.', strengths: ['Competitive pricing and free tier', 'Excellent performance and CDN integration', 'Simple self-service onboarding'], weaknesses: ['Advanced bot management is expensive add-on', 'Limited API security capabilities', 'Compliance reporting less mature', 'False positive management less sophisticated'], ourEdge: ['ML-powered bot management included', 'Automated API discovery and enforcement', 'Gartner Leader 9 consecutive years', 'Superior compliance and audit reporting'] },
    { name: 'Akamai App & API Protector', logo: '🔵', color: '#009bde', marketPosition: 'Leader', overview: 'Akamai is a strong WAF competitor with excellent global network. Very competitive at the enterprise level but significantly higher cost and complex pricing model.', strengths: ['Largest global CDN network (260,000+ servers)', 'Strong enterprise track record', 'Advanced API security capabilities'], weaknesses: ['Very high cost — premium pricing model', 'Complex pricing with many add-ons', 'Professional services required for optimal tuning', 'Slower innovation cycle than challengers'], ourEdge: ['More transparent and competitive pricing', 'Faster deployment and time-to-value', 'Superior threat intelligence from 9,000+ apps', 'More flexible deployment options'] },
  ],
  winLoss: { total: 60, won: 42, lost: 18, winRate: 70, competitors: [{ label: 'Cloudflare', wins: 22, pct: 73, color: '#22c55e' }, { label: 'AWS WAF', wins: 12, pct: 67, color: '#3b82f6' }, { label: 'Akamai', wins: 8, pct: 62, color: '#f59e0b' }], topMessages: ['ML bot management wins account-takeover-sensitive deals', 'API auto-discovery wins organisations with shadow API exposure', 'Gartner 9-year leadership wins risk-averse enterprise buyers'] },
  aiCoach: { customerSays: 'Our developers say Cloudflare is good enough and much cheaper.', suggestedResponse: 'Cloudflare is great for CDN and basic WAF rules, but when you need enterprise-grade bot management (to stop credential stuffing and account takeover), automated API discovery, and client-side Magecart protection, Cloudflare charges significant add-ons for each feature. Imperva includes all of these in a single platform. For PCI-DSS, HIPAA, or financial services compliance, Imperva\'s audit trail and reporting capabilities are also significantly more mature.', winProbability: 'HIGH', kvps: ['Gartner WAAP Leader for 9 consecutive years', 'ML bot management stops ATO and credential stuffing', 'Auto API discovery protects shadow APIs', 'Sub-3 second DDoS mitigation at 9+ Tbps'] },
},

];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/lauren-dashboard';
  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);

  let added = 0, updated = 0;
  for (const p of PRODUCTS) {
    const result = await Product.findOneAndUpdate(
      { practice: p.practice, product: p.product },
      { $set: { ...p, aiGenerated: false, aiGeneratedAt: null } },
      { upsert: true, new: true }
    );
    const isNew = result.createdAt && (Date.now() - result.createdAt.getTime()) < 5000;
    console.log(`  ✅ [${p.practice}] [${p.oem}] ${p.product}`);
    if (isNew) added++; else updated++;
  }

  console.log(`\nDone. ${added} added, ${updated} updated.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
