"""Generate an ATS-friendly, single-column resume PDF (selectable text, standard
headings, no multi-column/boxes/graphics). India + global standard. A4.
Deliberately omits phone number and date of birth (public hosted copy)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.colors import HexColor
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
                                ListFlowable, ListItem)
from reportlab.lib.styles import ParagraphStyle

INK = HexColor('#111111')
GREY = HexColor('#444444')
LINE = HexColor('#999999')

styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=19, leading=22,
                           textColor=INK, spaceAfter=1),
    'title': ParagraphStyle('title', fontName='Helvetica', fontSize=10.5, leading=13,
                            textColor=GREY, spaceAfter=3),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=9, leading=12,
                              textColor=GREY, spaceAfter=2),
    'h': ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=10.5, leading=13,
                        textColor=INK, spaceBefore=9, spaceAfter=2,
                        tracking=0),
    'sub': ParagraphStyle('sub', fontName='Helvetica-Bold', fontSize=10, leading=12.5,
                         textColor=INK, spaceBefore=5, spaceAfter=0),
    'meta': ParagraphStyle('meta', fontName='Helvetica-Oblique', fontSize=9, leading=12,
                          textColor=GREY, spaceAfter=2),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.3, leading=12.4,
                          textColor=INK, spaceAfter=2, alignment=TA_LEFT),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.3,
                            textColor=INK, spaceAfter=1.5, alignment=TA_LEFT),
}

def heading(text):
    return [Paragraph(text.upper(), styles['h']),
            HRFlowable(width='100%', thickness=0.6, color=LINE,
                       spaceBefore=1, spaceAfter=4)]

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(t, styles['bullet']), leftIndent=10, value='•')
         for t in items],
        bulletType='bullet', start='•', leftIndent=12, bulletFontName='Helvetica',
        bulletFontSize=9.3, spaceBefore=1, spaceAfter=3)

def role(company, title, dates, location, items):
    out = [Paragraph(f"{company} &mdash; {title}", styles['sub']),
           Paragraph(f"{dates} | {location}", styles['meta']),
           bullets(items)]
    return out

doc = SimpleDocTemplate('assets/Suchi-Bansal-Resume.pdf', pagesize=A4,
                        leftMargin=1.6*cm, rightMargin=1.6*cm,
                        topMargin=1.3*cm, bottomMargin=1.2*cm,
                        title='Suchi Bansal - Resume', author='Suchi Bansal',
                        subject='Senior Product Manager - AI & Enterprise Products')
S = []

# Header
S.append(Paragraph('SUCHI BANSAL', styles['name']))
S.append(Paragraph('Senior Product Manager &mdash; AI &amp; Enterprise Products', styles['title']))
S.append(Paragraph(
    'Gurugram, Haryana, India &nbsp;|&nbsp; suchiban07@gmail.com &nbsp;|&nbsp; '
    'linkedin.com/in/suchi-bansal-productmanager-ai &nbsp;|&nbsp; suchibansal.com',
    styles['contact']))
S.append(HRFlowable(width='100%', thickness=0.8, color=INK, spaceBefore=5, spaceAfter=2))

# Summary
S += heading('Professional Summary')
S.append(Paragraph(
    'Product Management professional with 11+ years of experience delivering AI-powered '
    'consumer and enterprise software products across mobility, enterprise automation, '
    'workflow automation, cybersecurity, and SaaS ecosystems. Currently leads '
    'commercialization and revenue growth for a $180M+ enterprise software portfolio at '
    'Canon India ($150M revenue). Proven expertise in product vision, strategy, roadmap, '
    'commercialization, pricing, and lifecycle management for products serving 7M+ users and '
    'multi-million-dollar portfolios. Strong background in AI product management (LLMs, SLMs, '
    'RAG, ML, NLP) and cross-functional leadership across Engineering, UX, Sales, Marketing, '
    'and Executive stakeholders.', styles['body']))

# Core skills
S += heading('Core Skills')
S.append(Paragraph(
    'Product Strategy &amp; Roadmap &bull; AI Product Management (LLMs, SLMs, RAG, ML, NLP) '
    '&bull; Go-to-Market (GTM) Strategy &bull; Product Commercialization &bull; Pricing, '
    'Packaging &amp; Monetization &bull; Revenue Growth &bull; Portfolio &amp; Lifecycle '
    'Management &bull; Enterprise SaaS &bull; Product-Led Growth &bull; Agile &amp; Scrum '
    '&bull; RICE Prioritization &bull; Product Discovery &bull; Customer Experience (CX) '
    '&bull; Market &amp; Competitive Analysis &bull; Product Analytics &bull; Data-Driven '
    'Decision Making &bull; API &amp; Enterprise Integrations (SAP, Salesforce, MS Dynamics) '
    '&bull; Stakeholder Management &bull; Cross-functional Leadership', styles['body']))
S.append(Paragraph(
    '<b>Tools:</b> SQL, Power BI, Tableau, Google Analytics, Mixpanel, Jira, Azure DevOps, '
    'Aha!, Figma, Pendo, Salesforce, HubSpot', styles['body']))

# Experience
S += heading('Professional Experience')
S += role('Canon India Pvt. Ltd.', 'Product Manager, Revenue &amp; Growth',
          'Jun 2025 &ndash; Present', 'Gurugram, India', [
    'Own strategy and lifecycle management of a $180M+ enterprise software portfolio spanning '
    'workflow automation, document management, print management, and cybersecurity for large '
    'enterprise customers.',
    'Spearheaded the shift from hardware-led sales to software-centric growth with targeted '
    'go-to-market strategies that increased enterprise conversion rates by 35%.',
    'Defined roadmaps and partnered with engineering to deliver scalable integrations with '
    'SAP, Salesforce, Microsoft Dynamics, and third-party enterprise platforms, reducing '
    'implementation timelines by 25%.',
    'Prioritized backlogs using the RICE framework, enabling delivery of 30+ enterprise '
    'solutions that generated approximately $150M in business revenue.',
    'Designed scalable pricing, packaging, and commercial models aligned to customer segments, '
    'reducing customer acquisition costs by 40% while expanding market penetration.',
    'Partnered with Sales, Marketing, Engineering, and Customer Success to strengthen sales '
    'enablement, accelerate enterprise adoption, and improve customer engagement.',
])
S += role('Samsung Research Institute &ndash; R&amp;D', 'Product Manager',
          'Jun 2021 &ndash; Jun 2025', 'India', [
    'Led end-to-end product strategy, roadmap, and commercialization for AI-powered consumer '
    'experiences across Samsung’s mobile and wearable ecosystem, serving 7M+ global users.',
    'Spearheaded collaborations with premier academic institutions (including IITs) to '
    'accelerate AI innovation using LLMs, SLMs, RAG, Machine Learning, and NLP.',
    'Launched digital health features — Medication Tracking, Snore Detection, and Sleep '
    'Coach — achieving 25% feature adoption within six months.',
    'Delivered AI-enabled smartwatch experiences driving 30%+ growth in wearable engagement '
    'within three months and supporting record device shipments.',
    'Built strategic partnerships (Tata 1mg, Bobble AI), creating new monetization '
    'opportunities exceeding $1M.',
    'Evaluated 2,000+ customer insights (Voice of Customer, analytics, competitive '
    'benchmarking), improving segmentation accuracy by 25%; informed portfolio strategy '
    'supporting $1B+ annual smartphone sales.',
])
S += role('Samsung Research Institute &ndash; R&amp;D', 'Assistant Product Manager',
          'Jun 2014 &ndash; May 2021', 'India', [
    'Managed the complete product lifecycle for multiple smartphone software features from '
    'ideation through launch, aligned to customer needs and business objectives.',
    'Delivered flagship “Make for India” initiatives — Ultra Data Saving (UDS) '
    'and S-Bike Mode — achieving 60% and 50% user adoption; supported sales exceeding '
    '8M devices.',
    'Defined requirements, prioritized backlogs, and collaborated with engineering using '
    'Agile methodologies to deliver high-quality releases across product generations.',
    'Resolved critical product issues (device heating, stability, UI responsiveness) with '
    '24–48 hour turnaround and 85% customer satisfaction.',
])

# Projects
S += heading('Key Projects &amp; Innovation')
S.append(bullets([
    '<b>Ecocreds</b> (Sustainability Hackathon) — carbon-credit incentives and '
    'gamification; incentivized 1,000+ sustainable actions.',
    '<b>EcoVoyage</b> — Carbon Offset as a Service (B2B/B2C); monetization models '
    'targeting INR 150+ Crore over three years.',
    '<b>ReachifyMe</b> (GenAI Hackathon) — US go-to-market strategy for an AI '
    'professional-branding platform; reduced customer acquisition cost by 75%.',
    '<b>Market Intelligence Board (MIB)</b> — automated competitive-intelligence platform '
    'accelerating strategic decision-making.',
]))

# Education
S += heading('Education')
S.append(bullets([
    'Executive MBA, HR &amp; Administration (People Management) — Tata Institute of Social '
    'Sciences (TISS), Mumbai',
    'Managing Brands &amp; Marketing Communication — MICA, Ahmedabad',
    'Proficiency in Korean Language — University of Delhi',
    'B.A. Political Science — Sri Venkateswara College, University of Delhi',
]))

# Patents
S += heading('Patents')
S.append(bullets([
    'Method &amp; System for Secure Data Sharing using Blockchain Network — Patent No. '
    '201941021587',
    'Action Emojis — Patent No. 201811046219',
]))

# Honors
S += heading('Honors &amp; Achievements')
S.append(bullets([
    'Spearheaded Startup Summit 2025, convening India’s leading AI, HealthTech, and '
    'DeepTech startups.',
    'Snore Detection &amp; Sleep Coach contributed to 200%+ quarter-on-quarter shipment growth '
    'for Samsung Watch 4.',
    '“Make for India” features supported sales exceeding 8 million devices.',
    'Led Academic Summit 1.0, establishing research partnerships that accelerated innovation '
    'pipelines.',
]))

# Languages
S += heading('Languages')
S.append(Paragraph('English, Hindi, Korean', styles['body']))

doc.build(S)
print('built assets/Suchi-Bansal-Resume.pdf')
