<template>
    <div>
        <!-- Navigation Bar -->
        <NavBar />

        <!-- Hero Section -->
        <section class="bg-white dark:bg-gray-900">
            <div class="max-w-screen-xl px-4 py-16 mx-auto lg:h-screen lg:items-center lg:flex">
                <div class="max-w-xl mx-auto text-center">
                    <h1 class="text-3xl font-extrabold sm:text-5xl text-gray-900 dark:text-white">
                        Welcome to Mental Health Chatbot
                    </h1>

                    <p class="mt-4 sm:leading-relaxed text-gray-500 dark:text-gray-300">
                        Your personal companion for mental well-being. Chat with our AI-powered assistant anytime,
                        anywhere.
                    </p>

                    <div class="flex flex-wrap justify-center mt-8 gap-4">
                        <router-link to="/register"
                            class="block w-full px-12 py-3 text-sm font-medium text-white bg-blue-600 rounded shadow sm:w-auto hover:bg-blue-700 focus:outline-none focus:ring">
                            Get Started
                        </router-link>

                        <router-link to="/login"
                            class="block w-full px-12 py-3 text-sm font-medium text-blue-600 bg-gray-100 rounded shadow sm:w-auto hover:bg-gray-200 focus:outline-none focus:ring">
                            Login
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="bg-gray-50 dark:bg-gray-800">
            <div class="max-w-screen-xl px-4 py-16 mx-auto">
                <div class="max-w-xl mx-auto text-center">
                    <h2 class="text-2xl font-bold sm:text-3xl text-gray-900 dark:text-white">
                        Why Choose Our Chatbot?
                    </h2>

                    <p class="mt-4 text-gray-500 dark:text-gray-300">
                        Our chatbot offers a range of features designed to support your mental health journey.
                    </p>
                </div>

                <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <!-- Feature 1 -->
                    <div class="p-8 bg-white dark:bg-gray-700 rounded shadow">
                        <div class="text-blue-500">
                            <!-- Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m0-4h.01M12 6.5a5.5 5.5 0 11-4.473 2.433" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">24/7 Availability</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-300">
                            Access support anytime you need it, day or night.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="p-8 bg-white dark:bg-gray-700 rounded shadow">
                        <div class="text-blue-500">
                            <!-- Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">Confidential Conversations</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-300">
                            Your privacy is our priority. All chats are secure and anonymous.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="p-8 bg-white dark:bg-gray-700 rounded shadow">
                        <div class="text-blue-500">
                            <!-- Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 1.343-3 3v1h6v-1c0-1.657-1.343-3-3-3z" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-xl font-bold text-gray-900 dark:text-white">Personalized Support</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-300">
                            Tailored responses to help you navigate your feelings and thoughts.
                        </p>
                    </div>

                    <!-- Add more features as needed -->
                </div>
            </div>
        </section>

        <!-- Footer -->
        <LandingFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavBar from '@/components/NavBar.vue';
import LandingFooter from '@/components/LandingFooter.vue';

export default defineComponent({
  name: 'LandingPage',
  components: {
    NavBar,
    LandingFooter,
  },
});
</script>