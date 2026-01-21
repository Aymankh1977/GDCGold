{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Roman;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import React from 'react';\
import \{ \
  Settings as SettingsIcon, \
  Globe, \
  Bell, \
  Shield,\
  Database,\
  Trash2\
\} from 'lucide-react';\
import \{ Card, CardHeader \} from '@/components/common/Card';\
import \{ Button \} from '@/components/common/Button';\
import \{ useAnalysisStore \} from '@/store/analysisStore';\
import \{ useDocumentStore \} from '@/store/documentStore';\
import \{ FRAMEWORKS \} from '@/config/accreditationFrameworks';\
\
const Settings: React.FC = () => \{\
  const \{ currentFramework, setCurrentFramework \} = useAnalysisStore();\
  const documentStore = useDocumentStore();\
  const analysisStore = useAnalysisStore();\
\
  const clearAllData = () => \{\
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) \{\
      localStorage.clear();\
      window.location.reload();\
    \}\
  \};\
\
  return (\
    <div className="space-y-6">\
      \{/* Page Header */\}\
      <div>\
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>\
        <p className="text-gray-500 mt-1">\
          Configure your DetEdTech platform preferences\
        </p>\
      </div>\
\
      \{/* Framework Selection */\}\
      <Card>\
        <CardHeader\
          title="Accreditation Framework"\
          subtitle="Select the accreditation framework for analysis"\
        />\
        <div className="space-y-4">\
          \{Object.values(FRAMEWORKS).map((framework) => (\
            <div\
              key=\{framework.id\}\
              className=\{`p-4 border rounded-lg cursor-pointer transition-colors\
                $\{currentFramework === framework.id\
                  ? 'border-primary-500 bg-primary-50'\
                  : 'border-gray-200 hover:border-gray-300'\}`\}\
              onClick=\{() => setCurrentFramework(framework.id)\}\
            >\
              <div className="flex items-center gap-3">\
                <Globe className="w-5 h-5 text-gray-500" />\
                <div>\
                  <p className="font-medium text-gray-900">\{framework.name\}</p>\
                  <p className="text-sm text-gray-500">\
                    \{framework.standards.length > 0 \
                      ? `$\{framework.standards.length\} standards configured`\
                      : 'Coming soon'\}\
                  </p>\
                </div>\
              </div>\
            </div>\
          ))\}\
        </div>\
      </Card>\
\
      \{/* Data Management */\}\
      <Card>\
        <CardHeader\
          title="Data Management"\
          subtitle="Manage your stored data"\
        />\
        <div className="space-y-4">\
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">\
            <div className="flex items-center gap-3">\
              <Database className="w-5 h-5 text-gray-500" />\
              <div>\
                <p className="font-medium text-gray-900">Documents</p>\
                <p className="text-sm text-gray-500">\
                  \{documentStore.documents.length\} documents stored\
                </p>\
              </div>\
            </div>\
          </div>\
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">\
            <div className="flex items-center gap-3">\
              <Database className="w-5 h-5 text-gray-500" />\
              <div>\
                <p className="font-medium text-gray-900">Analyses</p>\
                <p className="text-sm text-gray-500">\
                  \{analysisStore.analyses.length\} analyses stored\
                </p>\
              </div>\
            </div>\
          </div>\
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">\
            <div className="flex items-center gap-3">\
              <Database className="w-5 h-5 text-gray-500" />\
              <div>\
                <p className="font-medium text-gray-900">Reports</p>\
                <p className="text-sm text-gray-500">\
                  \{analysisStore.reports.length\} reports stored\
                </p>\
              </div>\
            </div>\
          </div>\
        </div>\
        <div className="mt-4 pt-4 border-t border-gray-200">\
          <Button\
            variant="outline"\
            className="text-red-600 border-red-300 hover:bg-red-50"\
            icon=\{<Trash2 className="w-4 h-4" />\}\
            onClick=\{clearAllData\}\
          >\
            Clear All Data\
          </Button>\
        </div>\
      </Card>\
\
      \{/* About */\}\
      <Card>\
        <CardHeader title="About DetEdTech" />\
        <div className="space-y-3 text-sm text-gray-600">\
          <p>\
            <strong>Version:</strong> 1.0.0\
          </p>\
          <p>\
            DetEdTech is an AI-powered platform designed to assist dental education \
            providers with GDC accreditation processes. It analyzes documents against \
            the 21 GDC Standards for Education requirements and provides comprehensive \
            evaluation reports.\
          </p>\
          <p className="text-gray-500">\
            \'a9 2024 DetEdTech. All rights reserved.\
          </p>\
        </div>\
      </Card>\
    </div>\
  );\
\};\
\
export default Settings;}