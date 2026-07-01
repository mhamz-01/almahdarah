import { SectionHeading } from "@/components/ui/section-heading";
import { FacultyCard } from "@/components/cards/faculty-card";
import { faculty } from "@/lib/data/faculty";

export function Faculty() {
  return (
    <section id="faculty" className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-[1240px] px-7 py-16 sm:py-20 lg:py-[104px]">
        <div className="max-w-[620px]">
          <SectionHeading eyebrow="Our Teachers" title="Qualified faculty" />
          <p className="mt-3 text-[15.5px] text-text">
            Teachers with sound credentials and gentle adab — chosen for both
            their knowledge and the way they pass it on.
          </p>
        </div>

        <div className="mt-[42px] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.map((member) => (
            <FacultyCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
