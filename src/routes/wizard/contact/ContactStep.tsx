import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeftIcon, ArrowRightIcon, LoaderCircleIcon } from "lucide-react"
import { useEffect, useLayoutEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useCategories, useGoals } from "@/api/queries"
import { useLocaleNavigate } from "@/locale/navigation"
import { contactSchema, type Contact, type EstimatePayload } from "@/api/schemas"
import { submitEstimate } from "@/api/submit"
import { FormField } from "@/components/common/FormField"
import { ButtonLink } from "@/components/common/ButtonLink"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useConfetti } from "@/lib/useConfetti"
import { SummaryPanel } from "@/routes/wizard/components/SummaryPanel"
import { WizardFooter } from "@/routes/wizard/components/WizardFooter"
import { WizardLayout } from "@/routes/wizard/components/WizardLayout"
import { useLocale } from "@/locale/useLocale"
import { useWizardActions, useWizardStore } from "@/store/wizard"
import type { SkillsLocationState } from "@/routes/wizard/guards"

const FORM_ID = "contact-form"

export default function ContactStep() {
  const { t } = useTranslation()
  const navigate = useLocaleNavigate()
  // RequireGoal + RequireSkills guarantee a goal with selections here.
  const goalId = useWizardStore((s) => s.goalId) ?? ""
  const savedContact = useWizardStore((s) => s.contact)
  const { setContact, resetWizard, pruneSelections } = useWizardActions()
  const { locale } = useLocale()

  const goal = useGoals().data?.find((g) => g.id === goalId)
  const catalog = useCategories(goalId).data

  // Drop persisted skills/connectors the catalog no longer has, so they are never submitted.
  // Emptying the selections this way sends the user back to /skills via RequireSkills.
  useLayoutEffect(() => {
    if (catalog) pruneSelections(catalog)
  }, [catalog, pruneSelections])

  // Bursts on arrival at the last step; `celebrate` runs again once the request is sent.
  const { celebrate } = useConfetti({ onMount: true })

  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: savedContact,
    mode: "onTouched",
  })
  const { errors } = form.formState

  // Persist typed values so a reload on Step 3 keeps them.
  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => setContact(values),
      }),
    [form, setContact],
  )

  const submit = useMutation({ mutationFn: submitEstimate })
  const locked = submit.isPending

  const onSubmit = form.handleSubmit((contact) => {
    const { selections } = useWizardStore.getState()
    const payload: EstimatePayload = {
      locale,
      goalId,
      skills: Object.entries(selections).map(([skillId, s]) => ({
        skillId,
        connectorIds: s.connectorIds,
      })),
      contact: { ...contact, company: contact.company || undefined },
    }
    // Per-call callback: it does not run if the user has left /contact (e.g. browser Back) before
    // the request settles, so a late success cannot reset edits made since.
    submit.mutate(payload, {
      onSuccess: async () => {
        // Commit the navigation first (flushSync bypasses the router's transition): resetting
        // while /contact is still rendered would trip its guard and redirect to /skills.
        celebrate()
        await navigate("/success", { state: { submitted: true }, replace: true, flushSync: true })
        resetWizard()
      },
    })
  })

  const goToCategory = (categoryId: string) =>
    void navigate("/skills", {
      state: { focusCategoryId: categoryId } satisfies SkillsLocationState,
    })

  return (
    <WizardLayout
      step={3}
      title={t("contact.title")}
      subtitle={t("contact.subtitle")}
      aside={
        <SummaryPanel
          goal={goal}
          catalog={catalog}
          onChangeCategory={goToCategory}
          disabled={locked}
        />
      }
      footer={
        <WizardFooter
          back={
            <ButtonLink
              variant="back"
              size="xl"
              to="/skills"
              disabled={locked}
              className="max-sm:px-4"
            >
              <ArrowLeftIcon />
              <span className="max-sm:sr-only">{t("contact.back")}</span>
            </ButtonLink>
          }
          next={
            <Button size="xl" type="submit" form={FORM_ID} disabled={locked || !catalog}>
              {locked ? t("common.sending") : t("contact.submit")}
              {locked ? <LoaderCircleIcon className="animate-spin" /> : <ArrowRightIcon />}
            </Button>
          }
        />
      }
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={onSubmit}
        className="mt-8 flex flex-col gap-6 lg:mt-14"
      >
        <FormField label={t("contact.name")} error={errors.name}>
          {(props) => <Input autoComplete="name" {...props} {...form.register("name")} />}
        </FormField>
        <FormField label={t("contact.email")} error={errors.email}>
          {(props) => (
            <Input type="email" autoComplete="email" {...props} {...form.register("email")} />
          )}
        </FormField>
        <FormField label={t("contact.company")} error={errors.company}>
          {(props) => (
            <Input autoComplete="organization" {...props} {...form.register("company")} />
          )}
        </FormField>
        {submit.isError && (
          <p role="alert" className="text-base text-danger">
            {t("common.submitError")}
          </p>
        )}
      </form>
    </WizardLayout>
  )
}
