<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#FF9800" />
        <rect x="14" y="14" width="4" height="4" fill="#fff" stroke="#fff" stroke-width="1" />
        <rect x="14" y="22" width="4" height="4" fill="#fff" stroke="#fff" stroke-width="1" />
        <rect x="14" y="30" width="4" height="4" fill="#fff" stroke="#fff" stroke-width="1" />
        <path d="M16 16l1 1 1-1" stroke="#FF9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M16 24l1 1 1-1" stroke="#FF9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="22" y="15" width="12" height="2" fill="#fff" rx="1" />
        <rect x="22" y="23" width="10" height="2" fill="#fff" rx="1" />
        <rect x="22" y="31" width="8" height="2" fill="#fff" rx="1" />
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

