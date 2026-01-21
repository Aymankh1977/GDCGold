{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React from 'react';\
import \{ classNames \} from '@/utils/helpers';\
\
interface CardProps \{\
  children: React.ReactNode;\
  className?: string;\
  padding?: 'none' | 'sm' | 'md' | 'lg';\
  hover?: boolean;\
\}\
\
export const Card: React.FC<CardProps> = (\{\
  children,\
  className,\
  padding = 'md',\
  hover = false,\
\}) => \{\
  const paddingStyles = \{\
    none: '',\
    sm: 'p-4',\
    md: 'p-6',\
    lg: 'p-8',\
  \};\
\
  return (\
    <div\
      className=\{classNames(\
        'bg-white rounded-xl shadow-sm border border-gray-100',\
        paddingStyles[padding],\
        hover && 'hover:shadow-md transition-shadow duration-200',\
        className\
      )\}\
    >\
      \{children\}\
    </div>\
  );\
\};\
\
interface CardHeaderProps \{\
  title: string;\
  subtitle?: string;\
  action?: React.ReactNode;\
\}\
\
export const CardHeader: React.FC<CardHeaderProps> = (\{\
  title,\
  subtitle,\
  action,\
\}) => \{\
  return (\
    <div className="flex items-start justify-between mb-4">\
      <div>\
        <h3 className="text-lg font-semibold text-gray-900">\{title\}</h3>\
        \{subtitle && <p className="text-sm text-gray-500 mt-1">\{subtitle\}</p>\}\
      </div>\
      \{action\}\
    </div>\
  );\
\};}