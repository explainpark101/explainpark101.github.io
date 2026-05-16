<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    
    <!-- Bubble Gradient -->
    <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F3F4F6"/>
    </linearGradient>
    
    <!-- Drop Shadow for Depth -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Base App Icon Rounded Rectangle -->
  <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bgGradient)" filter="url(#shadow)"/>

  <!-- Background Speech Bubble (Representing multiple messages / history) -->
  <path d="M 220 180
           A 100 80 0 1 1 420 180
           A 100 80 0 0 1 380 250
           L 420 280
           L 395 240
           A 100 80 0 0 1 220 180 Z" 
        fill="rgba(255, 255, 255, 0.25)" />

  <!-- Foreground Speech Bubble (Main focus) -->
  <path d="M 96 256
           A 128 104 0 1 1 352 256
           A 128 104 0 0 1 192 354
           L 112 392
           L 136 322
           A 128 104 0 0 1 96 256 Z" 
        fill="url(#bubbleGradient)" 
        filter="url(#shadow)" />

  <!-- Inner XML Symbol (< / >) representing parsing/code -->
  <!-- Left Bracket `<` -->
  <path d="M 184 232 L 152 256 L 184 280" 
        fill="none" 
        stroke="#2563EB" 
        stroke-width="20" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
        
  <!-- Center Slash `/` -->
  <path d="M 236 220 L 212 292" 
        fill="none" 
        stroke="#93C5FD" 
        stroke-width="16" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
        
  <!-- Right Bracket `>` -->
  <path d="M 264 232 L 296 256 L 264 280" 
        fill="none" 
        stroke="#2563EB" 
        stroke-width="20" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>
</template>