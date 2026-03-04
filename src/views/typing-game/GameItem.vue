<template>
  <div
    :class="[
      'absolute py-1 px-3 rounded-md text-lg break-words transition-transform duration-[50ms] ease-out will-change-transform',
      type === 'word' && 'text-gray-200 bg-slate-800/80 border border-gray-600',
      type === 'syntax' && 'text-base bg-purple-900/80 border border-purple-400'
    ]"
    :style="{
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
