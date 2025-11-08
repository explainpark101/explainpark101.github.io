<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none">
        <polygon points="24,12 36,36 12,36" fill="#FBC02D" />
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

