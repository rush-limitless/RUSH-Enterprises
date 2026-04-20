import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">RUSH Enterprises</CardTitle>
          <p className="text-muted-foreground text-sm">Connectez-vous pour continuer</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" variant="outline">
              Connexion avec Google
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("yahoo", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full" variant="outline">
              Connexion avec Yahoo
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
