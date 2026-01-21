{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  QuestionnaireQuestion, \
  QuestionnaireResponse, \
  Document, \
  Evidence \
\} from '../types';\
import \{ GDC_REQUIREMENTS \} from '../data/gdcStandards';\
\
export class QuestionnaireEngine \{\
  private questions: QuestionnaireQuestion[];\
\
  constructor() \{\
    this.questions = this.initializeQuestions();\
  \}\
\
  private initializeQuestions(): QuestionnaireQuestion[] \{\
    return [\
      \{\
        id: 'q1',\
        number: 'Q1',\
        text: 'Provider Name',\
        category: 'Basic Information',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q2',\
        number: 'Q2',\
        text: 'The full title of the qualification as it will appear on the certificate',\
        category: 'Basic Information',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q3',\
        number: 'Q3',\
        text: 'The name of the lead institution delivering the course',\
        category: 'Basic Information',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q4',\
        number: 'Q4',\
        text: 'The awarding body of the qualification',\
        category: 'Basic Information',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q5',\
        number: 'Q5',\
        text: 'The duration of the course (in weeks)',\
        category: 'Programme Structure',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q6',\
        number: 'Q6',\
        text: 'Give a brief format of the programme',\
        category: 'Programme Structure',\
        relatedRequirements: [9, 13]\
      \},\
      \{\
        id: 'q7',\
        number: 'Q7',\
        text: 'Name of the Programme Lead and the senior registrant responsible for signing off students',\
        category: 'Leadership',\
        relatedRequirements: [5, 8]\
      \},\
      \{\
        id: 'q8',\
        number: 'Q8',\
        text: 'Annual student intake',\
        category: 'Capacity',\
        relatedRequirements: [4, 15]\
      \},\
      \{\
        id: 'q9',\
        number: 'Q9',\
        text: 'Current student numbers for each year of study',\
        category: 'Capacity',\
        relatedRequirements: [4, 15]\
      \},\
      \{\
        id: 'q10',\
        number: 'Q10',\
        text: 'Details of other qualifications offered by your institution that leads to GDC registration',\
        category: 'Context',\
        relatedRequirements: []\
      \},\
      \{\
        id: 'q11',\
        number: 'Q11',\
        text: 'Please provide an organogram for the programme',\
        category: 'Structure',\
        relatedRequirements: [4, 5, 9]\
      \},\
      \{\
        id: 'q12',\
        number: 'Q12',\
        text: 'Provide details of when during the programme students attend the various clinical locations',\
        category: 'Clinical Training',\
        relatedRequirements: [3, 4, 12, 15]\
      \},\
      \{\
        id: 'q13',\
        number: 'Q13',\
        text: 'Please briefly summarise the assessment and delivery strategy for the programme',\
        category: 'Assessment',\
        relatedRequirements: [1, 13, 14, 16, 21]\
      \},\
      \{\
        id: 'q14',\
        number: 'Q14',\
        text: 'Please attach a copy of your "Blueprinting" or "Mapping of Assessment to the GDC Learning Outcomes"',\
        category: 'Assessment',\
        relatedRequirements: [13, 14, 16]\
      \},\
      \{\
        id: 'q15',\
        number: 'Q15',\
        text: 'Please add anything further you wish us to know about this programme',\
        category: 'Additional Information',\
        relatedRequirements: []\
      \}\
    ];\
  \}\
\
  getAllQuestions(): QuestionnaireQuestion[] \{\
    return this.questions;\
  \}\
\
  getQuestionById(id: string): QuestionnaireQuestion | undefined \{\
    return this.questions.find(q => q.id === id);\
  \}\
\
  analyzeResponse(\
    question: QuestionnaireQuestion,\
    currentAnswer: string,\
    document: Document\
  ): QuestionnaireResponse \{\
    const isComplete = this.checkCompleteness(currentAnswer, question);\
    const suggestions = this.generateSuggestions(question, currentAnswer, document);\
    const bestPractice = this.getBestPractice(question);\
    const evidenceFromDocuments = this.findRelevantEvidence(question, document);\
\
    return \{\
      questionId: question.id,\
      currentAnswer,\
      analysis: \{\
        isComplete,\
        suggestions,\
        bestPractice,\
        evidenceFromDocuments\
      \}\
    \};\
  \}\
\
  private checkCompleteness(answer: string, question: QuestionnaireQuestion): boolean \{\
    if (!answer || answer.trim().length === 0) return false;\
    \
    // Check minimum length based on question type\
    const minLengths: \{ [key: string]: number \} = \{\
      'Basic Information': 5,\
      'Programme Structure': 50,\
      'Leadership': 10,\
      'Capacity': 1,\
      'Context': 20,\
      'Structure': 30,\
      'Clinical Training': 100,\
      'Assessment': 100,\
      'Additional Information': 0\
    \};\
\
    const minLength = minLengths[question.category] || 10;\
    return answer.trim().length >= minLength;\
  \}\
\
  private generateSuggestions(\
    question: QuestionnaireQuestion,\
    currentAnswer: string,\
    document: Document\
  ): string[] \{\
    const suggestions: string[] = [];\
    \
    if (!currentAnswer || currentAnswer.trim().length === 0) \{\
      suggestions.push(`Please provide a response for: $\{question.text\}`);\
    \}\
\
    // Get related requirements and suggest including relevant information\
    for (const reqId of question.relatedRequirements) \{\
      const requirement = GDC_REQUIREMENTS.find(r => r.id === reqId);\
      if (requirement) \{\
        suggestions.push(\
          `Consider addressing GDC Requirement $\{reqId\} ($\{requirement.title\}) in your response`\
        );\
      \}\
    \}\
\
    // Check if document contains relevant information not in answer\
    const docText = document.extractedText.toLowerCase();\
    const answerText = currentAnswer.toLowerCase();\
    \
    const keywords = this.getKeywordsForQuestion(question);\
    for (const keyword of keywords) \{\
      if (docText.includes(keyword) && !answerText.includes(keyword)) \{\
        suggestions.push(\
          `Your documentation mentions "$\{keyword\}" - consider including this in your response`\
        );\
      \}\
    \}\
\
    return suggestions.slice(0, 5);\
  \}\
\
  private getBestPractice(question: QuestionnaireQuestion): string \{\
    const bestPractices: \{ [key: string]: string \} = \{\
      'q1': 'Provide the official registered name of your institution.',\
      'q2': 'Use the exact title that will appear on certificates and ensure it matches GDC records.',\
      'q3': 'Include the full institutional hierarchy (University, School, Division).',\
      'q4': 'Ensure the awarding body has appropriate recognition and authority.',\
      'q5': 'Break down by academic year, including teaching weeks and clinical hours.',\
      'q6': 'Describe the progression from pre-clinical to clinical phases, highlighting key milestones and competency assessments at each stage.',\
      'q7': 'Name a senior GDC registrant who takes responsibility for student sign-off and is familiar with GDC FtP guidance.',\
      'q8': 'Provide numbers that align with your capacity to supervise and assess students appropriately.',\
      'q9': 'Show progression data that demonstrates student support and appropriate standards.',\
      'q10': 'List all dental team programmes to show breadth of dental education experience.',\
      'q11': 'Show clear lines of responsibility, including clinical supervisors, academic leads, and quality assurance roles.',\
      'q12': 'Detail all clinical placements with supervision arrangements, learning outcomes, and quality assurance processes.',\
      'q13': 'Describe how assessments map to GDC learning outcomes, standard-setting procedures, and how clinical competence is verified.',\
      'q14': 'Provide a comprehensive mapping showing how each GDC learning outcome is assessed, when, and by what method.',\
      'q15': 'Highlight innovations, improvements since last inspection, or any contextual factors the panel should know.'\
    \};\
\
    return bestPractices[question.id] || 'Provide comprehensive, evidence-based responses aligned with GDC Standards for Education.';\
  \}\
\
  private findRelevantEvidence(question: QuestionnaireQuestion, document: Document): Evidence[] \{\
    const evidence: Evidence[] = [];\
    const text = document.extractedText;\
    const sentences = text.split(/[.!?]+/);\
    \
    const keywords = this.getKeywordsForQuestion(question);\
    \
    for (let i = 0; i < sentences.length; i++) \{\
      const sentence = sentences[i].trim().toLowerCase();\
      if (sentence.length < 20) continue;\
\
      const matchCount = keywords.filter(kw => sentence.includes(kw)).length;\
      \
      if (matchCount >= 2) \{\
        evidence.push(\{\
          text: sentences[i].trim(),\
          location: `Section $\{Math.floor(i / 10) + 1\}`,\
          relevanceScore: matchCount / keywords.length,\
          sourceDocument: document.name\
        \});\
      \}\
    \}\
\
    return evidence\
      .sort((a, b) => b.relevanceScore - a.relevanceScore)\
      .slice(0, 5);\
  \}\
\
  private getKeywordsForQuestion(question: QuestionnaireQuestion): string[] \{\
    const keywordMap: \{ [key: string]: string[] \} = \{\
      'q1': ['university', 'institution', 'provider', 'school'],\
      'q2': ['bachelor', 'degree', 'surgery', 'dental', 'bds'],\
      'q3': ['division', 'school', 'faculty', 'department'],\
      'q4': ['awarding', 'body', 'university'],\
      'q5': ['weeks', 'duration', 'year', 'semester'],\
      'q6': ['clinical', 'skills', 'patient', 'assessment', 'competency'],\
      'q7': ['programme lead', 'director', 'registrant', 'sign off'],\
      'q8': ['intake', 'admission', 'students', 'capacity'],\
      'q9': ['year 1', 'year 2', 'year 3', 'year 4', 'year 5', 'cohort'],\
      'q10': ['hygiene', 'therapy', 'dental nursing', 'qualification'],\
      'q11': ['organogram', 'structure', 'responsibility', 'leadership'],\
      'q12': ['outreach', 'placement', 'clinical', 'rotation', 'supervision'],\
      'q13': ['assessment', 'strategy', 'osce', 'examination', 'milestone', 'gateway'],\
      'q14': ['blueprint', 'mapping', 'learning outcome', 'assessment'],\
      'q15': ['development', 'improvement', 'innovation', 'challenge']\
    \};\
\
    return keywordMap[question.id] || [];\
  \}\
\}}