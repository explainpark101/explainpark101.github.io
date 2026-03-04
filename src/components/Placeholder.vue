<template>
    <div class="min-h-screen flex items-center justify-center p-8">
        <div class="text-center max-w-[600px]">
            <h2 class="text-3xl mb-4 text-[var(--primary-color)]">{{ title }}</h2>
            <p class="my-4 text-[var(--text-secondary)]">이 페이지는 아직 Vue 컴포넌트로 변환 중입니다.</p>
            <p class="my-4 text-[var(--text-secondary)]">기존 HTML 파일: <code class="px-1 py-0.5 bg-[var(--background)] rounded font-mono">{{ htmlPath }}</code></p>
            <router-link to="/" class="inline-block mt-8 text-[var(--primary-color)] no-underline font-medium hover:underline">← 홈으로 돌아가기</router-link>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    htmlPath: {
        type: String,
        required: true,
    },
});
</script>
