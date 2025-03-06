import type { Content } from "@prismicio/client"
import { SliceZone } from "@prismicio/react"
import { components } from "@/slices"
import Heading from "@/app/components/Heading"
import Bounded from "@/app/components/Bounded"
import Button from "./Button"

export default function ContentBody({
  page,
}: {
  page: Content.WorkDocument | Content.FargionWorkDocument
}) {
  return (
    <Bounded as="article">
      <div className="rounded-2xl border-2 border-slate-800 bg-slate-900 px-4 py-10 md:px-8 md:py-20">
        <Heading as="h1">{page.data.title}</Heading>

        <div className="prose prose-lg prose-invert mt-12 w-full max-w-none md:mt-20">
          <SliceZone slices={page.data.slices} components={components} />
        </div>

        {/* Use the link field from your Work document structure */}
        {page.data.link && page.data.title && (
          <div className="mt-8">
            <Button
              linkField={page.data.link}
              label= "Listen" // Using title as the label, or you could hardcode a label
              showIcon={true}
            />
          </div>
        )}
      </div>
    </Bounded>
  )
}
