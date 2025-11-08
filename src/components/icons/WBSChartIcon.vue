<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#4A90E2" />
        <rect x="18" y="14" width="12" height="6" rx="2" fill="white" />
        <path d="M24 20V26" stroke="#FFFFFF" stroke-width="2" />
        <path d="M16 26H32" stroke="#FFFFFF" stroke-width="2" />
        <rect x="13" y="32" width="8" height="5" rx="1.5" fill="white" />
        <rect x="22" y="32" width="8" height="5" rx="1.5" fill="white" />
        <rect x="31" y="32" width="8" height="5" rx="1.5" fill="white" />
        <path d="M17 26V32" stroke="#FFFFFF" stroke-width="2" />
        <path d="M31 26V32" stroke="#FFFFFF" stroke-width="2" />
    </svg>
</template>

<script setup>
defineProps({
    size: {
        type: [Number, String],
        default: 48
    }
});
</script>

