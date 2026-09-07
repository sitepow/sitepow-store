'use client'
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "react-hot-toast"
import { IconCheck, IconLoader2, IconSend } from "@tabler/icons-react"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MainSectionHeader } from "../../_components/MainSectionHeader"

export function ContactFormSection() {
  const t = useTranslations("contact.form")
  const topics = [0, 1, 2, 3, 4, 5].map((idx) => t(`topics.${idx}`))
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState(topics[0])
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) {
      toast.error(t("validationError"))
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success(t("toastSuccess"))
    }, 1000)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
      />
      <div className="border-border/80 bg-card/70 relative overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-md sm:p-8 md:p-10">
        <BorderBeam
          size={200}
          duration={10}
          colorFrom="#f97316"
          colorTo="#3b82f6"
          borderWidth={2}
        />
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-foreground text-2xl font-bold">
              {t("successTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              {t("successDesc")}
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false)
                setMessage("")
              }}
              variant="outline"
              className="mt-4 cursor-pointer"
            >
              {t("sendMoreBtn")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-foreground text-xs font-semibold"
                >
                  {t("nameLabel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder={t("namePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-foreground text-xs font-semibold"
                >
                  {t("phoneLabel")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground text-xs font-semibold"
                >
                  {t("emailLabel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-foreground text-xs font-semibold"
                >
                  {t("topicLabel")}
                </Label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border-input bg-background/50 ring-offset-background focus-visible:ring-ring flex h-11 w-full rounded-xl border px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm"
                >
                  {topics.map((tItem, idx) => (
                    <option
                      key={idx}
                      value={tItem}
                      className="bg-background text-foreground"
                    >
                      {tItem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-foreground text-xs font-semibold"
              >
                {t("messageLabel")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder={t("messagePlaceholder")}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="bg-background/50 rounded-xl text-sm leading-relaxed"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="shadow-primary/20 flex h-11 w-full cursor-pointer items-center justify-center gap-2 text-sm font-semibold shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    <span>{t("submittingBtn")}</span>
                  </>
                ) : (
                  <>
                    <IconSend size={18} />
                    <span>{t("submitBtn")}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
