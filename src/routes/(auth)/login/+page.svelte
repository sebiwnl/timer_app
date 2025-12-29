<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import TimerIcon from "@lucide/svelte/icons/timer";
    import MailIcon from "@lucide/svelte/icons/mail";
    import LockIcon from "@lucide/svelte/icons/lock";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import { appState } from "$lib/state.svelte";
    import { goto } from "$app/navigation";
    import ForgotPasswordModal from "$lib/components/ForgotPasswordModal.svelte";

    let email = $state("");
    let password = $state("");
    let showForgotPassword = $state(false);

    async function handleLogin(e: Event) {
        e.preventDefault();
        appState.clearAuthError();

        const success = await appState.login(email, password);

        if (success) {
            goto("/");
        }
    }

    function openForgotPassword() {
        showForgotPassword = true;
    }

    function closeForgotPassword() {
        showForgotPassword = false;
    }
</script>

<svelte:head>
    <title>Login - Workout Timer</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
        <!-- Back link -->
        <a
            href="/"
            class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back to Timer
        </a>

        <!-- Card -->
        <div class="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <!-- Header -->
            <div class="flex flex-col items-center mb-8">
                <div
                    class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                >
                    <TimerIcon class="w-6 h-6 text-primary" />
                </div>
                <h1 class="text-xl font-semibold text-foreground">
                    Welcome back
                </h1>
                <p class="text-sm text-muted-foreground mt-1">
                    Sign in to save and sync your configurations
                </p>
            </div>

            <!-- Form -->
            <form class="space-y-4" onsubmit={handleLogin}>
                <div class="space-y-2">
                    <Label for="email" class="text-sm font-medium">Email</Label>
                    <div class="relative">
                        <MailIcon
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            class="pl-10"
                            bind:value={email}
                            disabled={appState.authLoading}
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <Label for="password" class="text-sm font-medium">Password</Label>
                        <button
                            type="button"
                            onclick={openForgotPassword}
                            class="text-xs text-primary hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div class="relative">
                        <LockIcon
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            class="pl-10"
                            bind:value={password}
                            disabled={appState.authLoading}
                        />
                    </div>
                </div>

                {#if appState.authError}
                    <div class="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {appState.authError}
                    </div>
                {/if}

                <Button
                    type="submit"
                    class="w-full mt-6"
                    disabled={appState.authLoading || !email || !password}
                >
                    {appState.authLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>

            <ForgotPasswordModal bind:open={showForgotPassword} />

            <p class="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?
                <a
                    href="/signup"
                    class="text-primary hover:underline font-medium">Sign up</a
                >
            </p>
        </div>
    </div>
</div>
