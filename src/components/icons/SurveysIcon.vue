<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="#9C27B0" />
        <path d="M16 16h16M16 20h16M16 24h12" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        <circle cx="20" cy="28" r="2" fill="#fff" />
        <circle cx="28" cy="28" r="2" fill="#fff" />
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

