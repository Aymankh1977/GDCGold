{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React from 'react';\
import \{ Link \} from 'react-router-dom';\
import \{ \
  GraduationCap, \
  Bell, \
  Settings, \
  User,\
  Search\
\} from 'lucide-react';\
import \{ APP_NAME \} from '@/utils/constants';\
\
export const Header: React.FC = () => \{\
  return (\
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">\
      <div className="px-6 py-4 flex items-center justify-between">\
        \{/* Logo */\}\
        <Link to="/" className="flex items-center gap-3">\
          <div className="bg-gradient-to-br from-primary-600 to-accent-500 p-2 rounded-xl">\
            <GraduationCap className="w-8 h-8 text-white" />\
          </div>\
          <div>\
            <h1 className="text-2xl font-display font-bold text-gradient">\
              \{APP_NAME\}\
            </h1>\
            <p className="text-xs text-gray-500">GDC Accreditation AI Platform</p>\
          </div>\
        </Link>\
\
        \{/* Search */\}\
        <div className="flex-1 max-w-xl mx-8">\
          <div className="relative">\
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />\
            <input\
              type="text"\
              placeholder="Search documents, requirements, reports..."\
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg\
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"\
            />\
          </div>\
        </div>\
\
        \{/* Actions */\}\
        <div className="flex items-center gap-4">\
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">\
            <Bell className="w-5 h-5" />\
          </button>\
          <Link \
            to="/settings"\
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"\
          >\
            <Settings className="w-5 h-5" />\
          </Link>\
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">\
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">\
              <User className="w-5 h-5 text-primary-600" />\
            </div>\
          </button>\
        </div>\
      </div>\
    </header>\
  );\
\};}