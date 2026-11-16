"""Generate an ATS-friendly resume PDF with a light sky-blue accent:
sky-blue name/headline, sky-blue header rule, and full-width sky-blue section
bars. Single column, selectable text, no photos/multi-column — parses in ATS.
Also rasterizes the pages to PNG for the in-page modal viewer.
Omits phone number and date of birth (public hosted copy)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.colors import HexColor
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
                                ListFlowable, ListItem, Table, TableStyle, KeepTogether)
from reportlab.lib.styles import ParagraphStyle

INK   = HexColor('#1A1A1A')
GREY  = HexColor('#444444')
SKY   = HexColor('#1596D4')   # headline + rule
BAR_BG= HexColor('#B6DDF2')   # section bar background (light sky)
BAR_TX= HexColor('#0B3B55')   # section bar text (dark navy)

S = {
 'name':   ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=22, leading=24,
                          textColor=SKY, spaceAfter=1),
 'title':  ParagraphStyle('title', fontName='Helvetica-BoldOblique', fontSize=11, leading=14,
                          textColor=GREY, spaceAfter=5),
 'contact':ParagraphStyle('contact', fontName='Helvetica', fontSize=9, leading=13,
                          textColor=GREY),
 'bar':    ParagraphStyle('bar', fontName='Helvetica-Bold', fontSize=10.5, leading=14,
                          textColor=BAR_TX, backColor=BAR_BG, alignment=TA_CENTER,
                          borderPadding=(3.5, 5, 3.5, 5), spaceBefore=11, spaceAfter=6),
 'role':   ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=10.5, leading=13,
                          textColor=INK),
 'dates':  ParagraphStyle('dates', fontName='Helvetica-Bold', fontSize=9, leading=13,
                          textColor=GREY, alignment=TA_RIGHT),
 'body':   ParagraphStyle('body', fontName='Helvetica', fontSize=9.3, leading=12.5,
                          textColor=INK, spaceAfter=2, alignment=TA_LEFT),
 'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.4,
                          textColor=INK, spaceAfter=1.5, alignment=TA_LEFT),
}

PDF = 'assets/Suchi-Bansal-Resume.pdf'
doc = SimpleDocTemplate(PDF, pagesize=A4, leftMargin=1.5*cm, rightMargin=1.5*cm,
                        topMargin=1.2*cm, bottomMargin=1.1*cm,
                        title='Suchi Bansal - Resume', author='Suchi Bansal',
                        subject='Senior Product Manager - AI & Enterprise Products')

def heading(text):
    return Paragraph(text.upper(), S['bar'])

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(t, S['bullet']), leftIndent=10, value='•') for t in items],
        bulletType='bullet', start='•', leftIndent=13, bulletFontName='Helvetica',
        bulletColor=SKY, bulletFontSize=9.3, spaceBefore=1, spaceAfter=3)

def role_row(role, company, dates):
    left = Paragraph(f"{role} <font color='#1596D4'>&rsaquo;</font> {company}", S['role'])
    right = Paragraph(dates, S['dates'])
    t = Table([[left, right]], colWidths=[doc.width*0.70, doc.width*0.30])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    return t

F = []
# Header
F.append(Paragraph('SUCHI BANSAL', S['name']))
F.append(Paragraph('Senior Product Manager &ndash; AI &amp; Enterprise Products', S['title']))
F.append(Paragraph(
    "<b>Email:</b> suchiban07@gmail.com &nbsp;&nbsp;|&nbsp;&nbsp; "
    "<b>Location:</b> Gurugram, Haryana, India", S['contact']))
F.append(Paragraph(
    "<b>LinkedIn:</b> linkedin.com/in/suchi-bansal-productmanager-ai &nbsp;&nbsp;|&nbsp;&nbsp; "
    "<b>Portfolio:</b> suchibansal.com", S['contact']))
F.append(HRFlowable(width='100%', thickness=1.4, color=SKY, spaceBefore=6, spaceAfter=2))

# Summary
F.append(heading('Professional Summary'))
F.append(Paragraph(
    'Product Management professional with 11+ years of experience delivering AI-powered '
    'consumer and enterprise software products across mobility, enterprise automation, '
    'workflow automation, cybersecurity, and SaaS ecosystems. Currently leads '
    'commercialization and revenue growth for a $180M+ enterprise software portfolio at '
    'Canon India ($150M revenue). Proven expertise in product vision, strategy, roadmap, '
    'commercialization, pricing, and lifecycle management for products serving 7M+ users and '
    'multi-million-dollar portfolios. Strong background in AI product management (LLMs, SLMs, '
    'RAG, ML, NLP) and cross-functional leadership across Engineering, UX, Sales, Marketing, '
    'and Executive stakeholders.', S['body']))

# Core skills
F.append(heading('Core Skills'))
F.append(Paragraph(
    'Product Strategy &amp; Roadmap &bull; AI Product Management (LLMs, SLMs, RAG, ML, NLP) '
    '&bull; Go-to-Market (GTM) Strategy &bull; Product Commercialization &bull; Pricing, '
    'Packaging &amp; Monetization &bull; Revenue Growth &bull; Portfolio &amp; Lifecycle '
    'Management &bull; Enterprise SaaS &bull; Product-Led Growth &bull; Agile &amp; Scrum '
    '&bull; RICE Prioritization &bull; Product Discovery &bull; Customer Experience (CX) '
    '&bull; Market &amp; Competitive Analysis &bull; Product Analytics &bull; Data-Driven '
    'Decision Making &bull; API &amp; Enterprise Integrations (SAP, Salesforce, MS Dynamics) '
    '&bull; Stakeholder Management &bull; Cross-functional Leadership', S['body']))
F.append(Paragraph(
    '<b>Tools:</b> SQL, Power BI, Tableau, Google Analytics, Mixpanel, Jira, Azure DevOps, '
    'Aha!, Figma, Pendo, Salesforce, HubSpot', S['body']))

# Experience
F.append(heading('Professional Experience'))
F.append(role_row('Product Manager, Revenue &amp; Growth', 'Canon India Pvt. Ltd.',
                  'Jun 2025 &ndash; Present'))
F.append(bullets([
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
]))
F.append(role_row('Product Manager', 'Samsung Research Institute &ndash; R&amp;D',
                  'Jun 2021 &ndash; Jun 2025'))
F.append(bullets([
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
]))
F.append(role_row('Assistant Product Manager', 'Samsung Research Institute &ndash; R&amp;D',
                  'Jun 2014 &ndash; May 2021'))
F.append(bullets([
    'Managed the complete product lifecycle for multiple smartphone software features from '
    'ideation through launch, aligned to customer needs and business objectives.',
    'Delivered flagship “Make for India” initiatives — Ultra Data Saving (UDS) and '
    'S-Bike Mode — achieving 60% and 50% user adoption; supported sales exceeding 8M devices.',
    'Defined requirements, prioritized backlogs, and collaborated with engineering using '
    'Agile methodologies to deliver high-quality releases across product generations.',
    'Resolved critical product issues (device heating, stability, UI responsiveness) with '
    '24–48 hour turnaround and 85% customer satisfaction.',
]))

# Projects
F.append(heading('Key Projects &amp; Innovation'))
F.append(bullets([
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
F.append(heading('Education'))
F.append(bullets([
    'Executive MBA, HR &amp; Administration (People Management) — Tata Institute of Social '
    'Sciences (TISS), Mumbai',
    'Managing Brands &amp; Marketing Communication — MICA, Ahmedabad',
    'Proficiency in Korean Language — University of Delhi',
    'B.A. Political Science — Sri Venkateswara College, University of Delhi',
]))

# Patents
F.append(heading('Patents'))
F.append(bullets([
    'Method &amp; System for Secure Data Sharing using Blockchain Network — Patent No. '
    '201941021587',
    'Action Emojis — Patent No. 201811046219',
]))

# Honors
F.append(heading('Honors &amp; Achievements'))
F.append(bullets([
    'Spearheaded Startup Summit 2025, convening India’s leading AI, HealthTech, and '
    'DeepTech startups.',
    'Snore Detection &amp; Sleep Coach contributed to 200%+ quarter-on-quarter shipment growth '
    'for Samsung Watch 4.',
    '“Make for India” features supported sales exceeding 8 million devices.',
    'Led Academic Summit 1.0, establishing research partnerships that accelerated innovation '
    'pipelines.',
]))

# Languages
F.append(heading('Languages'))
F.append(Paragraph('English, Hindi, Korean', S['body']))

doc.build(F)
print('built', PDF)

# Rasterize pages to PNG for the in-page modal viewer
import pymupdf
d = pymupdf.open(PDF)
for i in range(d.page_count):
    d[i].get_pixmap(dpi=150).save(f'assets/resume-page-{i+1}.png')
print('rendered', d.page_count, 'page images')
