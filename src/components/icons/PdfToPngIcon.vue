<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="24" height="36" rx="2" fill="#4f46e5" stroke="#4f46e5" stroke-width="2" />
        <rect x="12" y="12" width="12" height="8" rx="1" fill="#fff" opacity="0.9" />
        <path d="M12 28h12M12 32h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        <path d="M32 24l8 8-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
