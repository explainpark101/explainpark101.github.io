<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" fill="#43A047" />
        <path d="M24 16v8l6 6" stroke="#fff" stroke-width="3" stroke-linecap="round" />
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

