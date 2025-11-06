<template>
    <div class="placeholder-wrapper">
        <div class="placeholder-content">
            <h2>{{ title }}</h2>
            <p>이 페이지는 아직 Vue 컴포넌트로 변환 중입니다.</p>
            <p>기존 HTML 파일: <code>{{ htmlPath }}</code></p>
            <router-link to="/" class="back-link">← 홈으로 돌아가기</router-link>
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

<style scoped>
.placeholder-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.placeholder-content {
    text-align: center;
    max-width: 600px;
}

.placeholder-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #1976d2;
}

.placeholder-content p {
    margin: 1rem 0;
    color: #666;
}

.placeholder-content code {
    background: #f5f5f5;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: monospace;
}

.back-link {
    display: inline-block;
    margin-top: 2rem;
    color: #1976d2;
    text-decoration: none;
    font-weight: 500;
}

.back-link:hover {
    text-decoration: underline;
}
</style>
