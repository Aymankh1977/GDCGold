{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React from 'react';\
import \{ classNames \} from '@/utils/helpers';\
\
interface ProgressBarProps \{\
  progress: number;\
  size?: 'sm' | 'md' | 'lg';\
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';\
  showLabel?: boolean;\
  label?: string;\
\}\
\
export const ProgressBar: React.FC<ProgressBarProps> = (\{\
  progress,\
  size = 'md',\
  color = 'primary',\
  showLabel = false,\
  label,\
\}) => \{\
  const sizeStyles = \{\
    sm: 'h-1.5',\
    md: 'h-2.5',\
    lg: 'h-4',\
  \};\
\
  const colorStyles = \{\
    primary: 'bg-primary-600',\
    accent: 'bg-accent-500',\
    success: 'bg-green-500',\
    warning: 'bg-yellow-500',\
    danger: 'bg-red-500',\
  \};\
\
  const clampedProgress = Math.min(100, Math.max(0, progress));\
\
  return (\
    <div className="w-full">\
      \{showLabel && (\
        <div className="flex justify-between mb-1">\
          <span className="text-sm font-medium text-gray-700">\
            \{label || 'Progress'\}\
          </span>\
          <span className="text-sm font-medium text-gray-700">\
            \{clampedProgress\}%\
          </span>\
        </div>\
      )\}\
      <div className=\{classNames('w-full bg-gray-200 rounded-full', sizeStyles[size])\}>\
        <div\
          className=\{classNames(\
            'rounded-full transition-all duration-500 ease-out',\
            sizeStyles[size],\
            colorStyles[color]\
          )\}\
          style=\{\{ width: `$\{clampedProgress\}%` \}\}\
        />\
      </div>\
    </div>\
  );\
\};}