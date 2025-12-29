<script lang="ts">
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { appState } from "$lib/state.svelte";
    import MailIcon from "@lucide/svelte/icons/mail";
    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";

    let { open = $bindable(false) } = $props();

    let email = $state("");
    let success = $state(false);

    async function handleResetPassword(e: Event) {
        e.preventDefault();
        appState.clearAuthError();

        const result = await appState.resetPassword(email);

        if (result) {
            success = true;
        }
    }

    function handleClose() {
        email = "";
        success = false;
        appState.clearAuthError();
        open = false;
    }
</script>

<Sheet.Root bind:open>
    <Sheet.Content class="w-full sm:max-w-md">
        <Sheet.Header>
            <Sheet.Title>Reset Password</Sheet.Title>
            <Sheet.Description>
                Enter your email address and we'll send you a link to reset your password.
            </Sheet.Description>
        </Sheet.Header>

        <div class="py-6">
            {#if success}
                <div class="flex flex-col items-center text-center space-y-4">
                    <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircleIcon class="w-8 h-8 text-green-600" />
                    </div>
                    <div class="space-y-2">
                        <h3 class="text-lg font-semibold">Check your email</h3>
                        <p class="text-sm text-muted-foreground">
                            We've sent a password reset link to your email address. Click the link to reset your password.
                        </p>
                    </div>
                </div>
            {:else}
                <form onsubmit={handleResetPassword} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="reset-email">Email</Label>
                        <div class="relative">
                            <MailIcon
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                            />
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                class="pl-10"
                                bind:value={email}
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
                        class="w-full"
                        disabled={appState.authLoading || !email}
                    >
                        {appState.authLoading ? 'Sending...' : 'Send reset link'}
                    </Button>
                </form>
            {/if}
        </div>

        <Sheet.Footer>
            <Button variant="ghost" onclick={handleClose}>
                {success ? 'Close' : 'Cancel'}
            </Button>
        </Sheet.Footer>
    </Sheet.Content>
</Sheet.Root>
