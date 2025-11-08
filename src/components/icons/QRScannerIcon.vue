<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="4" fill="#2E7D32" />
        <rect x="12" y="12" width="6" height="6" fill="#fff" />
        <rect x="14" y="14" width="2" height="2" fill="#2E7D32" />
        <rect x="30" y="12" width="6" height="6" fill="#fff" />
        <rect x="32" y="14" width="2" height="2" fill="#2E7D32" />
        <rect x="12" y="30" width="6" height="6" fill="#fff" />
        <rect x="14" y="32" width="2" height="2" fill="#2E7D32" />
        <rect x="20" y="12" width="2" height="2" fill="#fff" />
        <rect x="24" y="12" width="2" height="2" fill="#fff" />
        <rect x="20" y="16" width="2" height="2" fill="#fff" />
        <rect x="24" y="16" width="2" height="2" fill="#fff" />
        <rect x="20" y="20" width="8" height="8" fill="#fff" />
        <rect x="22" y="22" width="4" height="4" fill="#2E7D32" />
        <rect x="30" y="20" width="2" height="2" fill="#fff" />
        <rect x="34" y="20" width="2" height="2" fill="#fff" />
        <rect x="30" y="24" width="2" height="2" fill="#fff" />
        <rect x="34" y="24" width="2" height="2" fill="#fff" />
        <rect x="20" y="30" width="2" height="2" fill="#fff" />
        <rect x="24" y="30" width="2" height="2" fill="#fff" />
        <rect x="30" y="30" width="2" height="2" fill="#fff" />
        <rect x="34" y="30" width="2" height="2" fill="#fff" />
        <rect x="20" y="34" width="2" height="2" fill="#fff" />
        <rect x="24" y="34" width="2" height="2" fill="#fff" />
        <rect x="30" y="34" width="2" height="2" fill="#fff" />
        <rect x="34" y="34" width="2" height="2" fill="#fff" />
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

