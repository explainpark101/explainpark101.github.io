<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="#7B1FA2" />
        <path d="M24 16v16M16 24h16" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        <circle cx="24" cy="24" r="4" fill="#fff" />
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

