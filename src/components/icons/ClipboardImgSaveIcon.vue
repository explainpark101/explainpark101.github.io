<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="24" height="32" rx="4" fill="#00BCD4" stroke="#00BCD4" stroke-width="2" />
        <rect x="12" y="2" width="16" height="6" rx="2" fill="#fff" />
        <rect x="14" y="14" width="12" height="8" rx="2" fill="#fff" opacity="0.9" />
        <circle cx="20" cy="18" r="2" fill="#00BCD4" />
        <path d="M14 26h12M14 30h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        <path d="M32 24l8 8-8 8" stroke="#00BCD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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

