{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ QuestionnaireResponse, GDCRequirement \} from '@/types';\
import \{ getAllRequirements \} from '@/config/gdcStandards';\
\
export interface GoldStandardRecommendation \{\
  questionId: string;\
  requirement: GDCRequirement | null;\
  bestPractice: string;\
  exemplarResponse: string;\
  keyElements: string[];\
\}\
\
export const generateGoldStandardRecommendations = (\
  responses: QuestionnaireResponse[]\
): GoldStandardRecommendation[] => \{\
  const requirements = getAllRequirements();\
  \
  return responses.map(response => \{\
    const matchedRequirement = findMatchingRequirement(response, requirements);\
    \
    return \{\
      questionId: response.questionId,\
      requirement: matchedRequirement,\
      bestPractice: generateBestPractice(response, matchedRequirement),\
      exemplarResponse: generateExemplarResponse(response, matchedRequirement),\
      keyElements: identifyKeyElements(matchedRequirement),\
    \};\
  \});\
\};\
\
const findMatchingRequirement = (\
  response: QuestionnaireResponse,\
  requirements: GDCRequirement[]\
): GDCRequirement | null => \{\
  const questionLower = response.question.toLowerCase();\
  \
  // Try to match question to a requirement\
  for (const req of requirements) \{\
    const reqLower = req.description.toLowerCase();\
    const titleLower = req.title.toLowerCase();\
    \
    // Simple keyword matching\
    if (questionLower.includes(titleLower) || \
        titleLower.split(' ').some(word => questionLower.includes(word))) \{\
      return req;\
    \}\
  \}\
  \
  return null;\
\};\
\
const generateBestPractice = (\
  response: QuestionnaireResponse,\
  requirement: GDCRequirement | null\
): string => \{\
  if (requirement) \{\
    return `For $\{requirement.title\}, best practice includes: $\{requirement.evidenceExamples.slice(0, 3).join('; ')\}`;\
  \}\
  \
  return 'Provide comprehensive, evidence-based responses with clear policy references';\
\};\
\
const generateExemplarResponse = (\
  response: QuestionnaireResponse,\
  requirement: GDCRequirement | null\
): string => \{\
  if (!requirement) \{\
    return 'A thorough response should include specific details, policy references, and supporting evidence.';\
  \}\
  \
  return `An exemplar response for $\{requirement.title\} would include:\
- Clear description of current practices\
- Reference to specific policies and procedures\
- Evidence examples: $\{requirement.evidenceExamples.slice(0, 2).join(', ')\}\
- Demonstration of compliance with GDC standards`;\
\};\
\
const identifyKeyElements = (requirement: GDCRequirement | null): string[] => \{\
  if (!requirement) \{\
    return [\
      'Specific details',\
      'Policy references',\
      'Evidence citations',\
      'Clear explanations'\
    ];\
  \}\
  \
  return requirement.evidenceExamples.slice(0, 4);\
\};}