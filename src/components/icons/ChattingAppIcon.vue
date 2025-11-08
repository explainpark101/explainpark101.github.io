<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#03A9F4" />
        <path
            d="M16 18C16 16.8954 16.8954 16 18 16H30C31.1046 16 32 16.8954 32 18V26C32 27.1046 31.1046 28 30 28H22L16 32V28V18Z"
            fill="white" />
        <circle cx="21" cy="22" r="1.5" fill="#03A9F4" />
        <circle cx="27" cy="22" r="1.5" fill="#03A9F4" />
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

