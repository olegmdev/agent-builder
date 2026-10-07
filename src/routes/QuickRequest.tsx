import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { LoaderCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { quickRequestSchema, type QuickRequest as QuickRequestValues } from "@/api/schemas"
import { submitQuickRequest } from "@/api/submit"
import { useLocaleNavigate } from "@/locale/navigation"
import { FormField } from "@/components/common/FormField"
import { AppImage } from "@/components/common/AppImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/locale/useLocale"

export default function QuickRequest() {
  const { t } = useTranslation()
  const navigate = useLocaleNavigate()
  const { locale } = useLocale()
  const form = useForm<QuickRequestValues>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: { name: "", email: "", agentName: "", reason: "" },
    mode: "onTouched",
  })
  const { errors } = form.formState

  const submit = useMutation({
    mutationFn: submitQuickRequest,
    onSuccess: () => navigate("/success", { state: { submitted: true }, replace: true }),
  })

  const onSubmit = form.handleSubmit((values) => submit.mutate({ ...values, locale }))

  return (
    <main className="mx-auto grid w-full max-w-page flex-1 grid-cols-1 content-start gap-12 pb-12 lg:grid-cols-[580fr_548fr] lg:content-stretch lg:items-center">
      <section className="flex flex-col justify-center">
        <h1 className="text-[1.75rem] leading-[1.2] tracking-tight text-ink sm:text-[2.25rem] lg:text-[2.5rem]">
          {t("quick.title")}
        </h1>
        <p className="mt-3 text-base text-ink-muted sm:mt-4">{t("quick.subtitle")}</p>
        <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-6 lg:mt-11">
          <FormField label={t("quick.name")} error={errors.name}>
            {(props) => <Input autoComplete="name" {...props} {...form.register("name")} />}
          </FormField>
          <FormField label={t("quick.email")} error={errors.email}>
            {(props) => (
              <Input type="email" autoComplete="email" {...props} {...form.register("email")} />
            )}
          </FormField>
          <FormField label={t("quick.agentName")} error={errors.agentName}>
            {(props) => <Input {...props} {...form.register("agentName")} />}
          </FormField>
          <FormField label={t("quick.reason")} error={errors.reason}>
            {(props) => (
              <Textarea
                {...props}
                className={`${props.className} h-30 resize-none py-4 [field-sizing:fixed]`}
                {...form.register("reason")}
              />
            )}
          </FormField>
          {submit.isError && (
            <p role="alert" className="text-base text-danger">
              {t("common.submitError")}
            </p>
          )}
          <div>
            <Button size="xl" type="submit" disabled={submit.isPending} className="max-sm:w-full">
              {submit.isPending ? t("common.sending") : t("quick.submit")}
              {submit.isPending && <LoaderCircleIcon className="animate-spin" />}
            </Button>
          </div>
        </form>
      </section>
      {/* The form is the point on smaller screens; the illustration only fills the desktop column. */}
      <AppImage
        src="common/landing.jpg"
        alt={t("common.illustrationAlt")}
        // Out of flow, so the form sets the page height and the image fills what is left.
        className="relative h-full max-h-140 min-h-96 max-lg:hidden overflow-hidden"
        // The artwork has more white space below the robot than above, so nudge it down to centre it.
        imgClassName="absolute inset-0 translate-y-[6%]"
      />
    </main>
  )
}
