import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Neo-Brutalism

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--background)",
					"--normal-text": "var(--foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius-base)",
				} as React.CSSProperties
			}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: "flex items-center gap-2.5 p-4 w-[22rem] [&:has(button)]:justify-between bg-background shadow-default rounded-base border-border border-2 text-foreground text-sm font-heading",
					description: "font-base text-foreground",
					actionButton:
						"shrink-0 h-6 px-2 bg-primary border-2 border-border rounded-base text-sm font-base text-primary-foreground ",
					cancelButton:
						"shrink-0 h-6 px-2 border-2 border-border rounded-base text-sm font-base text-foreground",
					error: "bg-black text-white",
					loading:
						"[&[data-sonner-toast]_[data-icon]]:flex [&[data-sonner-toast]_[data-icon]]:size-4 [&[data-sonner-toast]_[data-icon]]:relative [&[data-sonner-toast]_[data-icon]]:justify-start [&[data-sonner-toast]_[data-icon]]:items-center [&[data-sonner-toast]_[data-icon]]:flex-shrink-0",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
