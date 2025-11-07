<template>
  <div
    :class="['item', type]"
    :style="{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: zIndex
    }"
  >
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['word', 'syntax'].includes(value)
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  zIndex: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.item {
  color: #e5e7eb;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 1.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: transform 50ms ease-out;
  will-change: transform;
}

.item.word {
  background-color: rgba(30, 41, 59, 0.8);
  border: 1px solid #4b5563;
}

.item.syntax {
  background-color: rgba(59, 17, 107, 0.8);
  border: 1px solid #c084fc;
  font-size: 1rem;
}
</style>

