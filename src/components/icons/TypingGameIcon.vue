<template>
    <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#263386" />
        <rect x="13" y="12" width="14" height="5" rx="2.5" fill="white" fill-opacity="0.95" />
        <rect x="25" y="19" width="10" height="5" rx="2.5" fill="white" fill-opacity="0.95" />
        <rect x="16" y="26" width="16" height="5" rx="2.5" fill="white" fill-opacity="0.95" />
        <path d="M12 39L14 35L34 35L36 39L12 39Z" fill="#FFFFFF" />
        <path d="M14 35L34 35L36 39L35 40L13 40L12 39L14 35Z" fill="#E0E0E0" />
        <rect x="19" y="36" width="10" height="1.5" rx="0.75" fill="#4A90E2" fill-opacity="0.6" />
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

