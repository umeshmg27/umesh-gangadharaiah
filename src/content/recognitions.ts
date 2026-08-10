import type { LocalImageAsset, Recognition } from "./models";

function publicRecognitionAsset(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

function recognitionImage(
  id: string,
  title: string,
  width: number,
  height: number,
) {
  return {
    kind: "local",
    alt: `Recognition: ${title}`,
    fallbackSrc: publicRecognitionAsset(`assets/images/recognition/${id}.jpeg`),
    sources: [],
    width,
    height,
  } as const satisfies LocalImageAsset;
}

export const recognitions = [
  {
    id: "priyanka-181224",
    title: "Cisco KT Sessions",
    description:
      "Dear Volunteer, Thank you for your amazing partnership with the India ETR team!! The success of the Campus Ambassador Program is a testament to the dedication and enthusiasm of amazing individuals like you. Your commitment and hard work transformed this program into something truly exceptional. From screening applications and conducting interviews over weekends to providing support wherever needed, your efforts have made a significant impact. We deeply appreciate your passion, hard work and the time you invested in this initiative. Your contributions are greatly appreciated, and we are sincerely grateful for everything you've done. Thank you for your tremendous support. We look forward to collaborating with you on future events and continuing to make a difference together. Thanks Priyanka Bhagat APJC ETR Leader",
    image: recognitionImage("priyanka-181224", "Cisco KT Sessions", 1600, 1158),
    tags: ["Mentorship"],
    category: "Mentorship",
    highlightOrder: 3,
  },
  {
    id: "damo-211224",
    title: "Ownership towards NDO ESG triages",
    description:
      "You have been demonstrating ownership and responsibility triaging NDO ESG issues that saves QA cycle time. Keep up the good work.",
    image: recognitionImage("damo-211224", "Ownership towards NDO ESG triages", 1600, 1166),
    tags: ["Leadership"],
    category: "Leadership",
  },
  {
    id: "srid-181024",
    title: "Release ownership and triages",
    description:
      "Hi Umesh, I want to thank you for all the hard work you have been doing in the Denali release. You have always been interested to pick up any code changes/verification and get it done with utmost quality. I know you have been working on multiple items this release but still you were ready to pick up changes in backup/restore for licensing and completed it with high quality. Keep up the good work!",
    image: recognitionImage("srid-181024", "Release ownership and triages", 1600, 1153),
    tags: ["Mentorship"],
    category: "Mentorship",
  },
  {
    id: "alfan-141124",
    title: "The right help at the right time",
    description:
      "Bobby and Umesh, I would like to thank you both for helping us make the migration to NDO 4.2.3 for Allianz a success. I appreciate all the time and effort that you put into the fix for this unusual problem that we encountered in their setup (an invalid configuration that the upgrade validation script was not able to catch) and also for helping us implement the fixes during the actual window. It was a very stressful situation that lasted for some months, but with your help and support we were able to finally overcome it. Thank you again. Alfonso",
    image: recognitionImage("alfan-141124", "The right help at the right time", 1600, 1163),
    tags: ["Innovation"],
    category: "Innovation",
  },
  {
    id: "rohi-171024",
    title: "Feature Ownership",
    description:
      "HI Umesh, I want to thank you for your contributions towards the licensing, restore without sites feature for Denali and also the NX-ACI ground work. You balanced all of it very well along with supporting ESG QA and solving ESG bugs. I also want to thank you for being always there to help all the team members. Thanks again",
    image: recognitionImage("rohi-171024", "Feature Ownership", 1600, 1158),
    tags: ["Leadership"],
    category: "Leadership",
    highlightOrder: 5,
  },
  {
    id: "atul-180724",
    title: "Driving ESG IT",
    description:
      "Umesh, Thanks for driving the ESG IT from NDO perspective. Your enthusiasm to try new cases and dig deeper to uncover the issues has been instrumental in resolving IT issues quickly. Appreciate working across timezones and reaching out to folks to explain and help root cause the issues found. Keep it up !! Atul",
    image: recognitionImage("atul-180724", "Driving ESG IT", 1600, 1159),
    tags: ["Innovation"],
    category: "Innovation",
  },
  {
    id: "rohi-110624",
    title: "Contribution to ESG feature IT",
    description:
      "Hi Umesh, I wanted to thank you for all the effort you put in for making the ESG IT smooth and seamless. You went above and beyond to make sure things are on track, be it hand holding the switch team for NDO config, be it going to their place to solve their doubts, be it debugging issues with them in late nights. Your effort is much appreciated and recognised. Thanks again.",
    image: recognitionImage("rohi-110624", "Contribution to ESG feature IT", 1600, 1152),
    tags: ["Leadership"],
    category: "Leadership",
  },
  {
    id: "srid-010424",
    title: "Thank you for excellent work on Restore feature",
    description:
      "Thanks a lot Umesh for all your excellent work on the Unified Backup Restore Feature. You are always responsible and strive to complete your work well and on time. You played a crucial role in delivering the feature on time with high quality. Thank you for going above and beyond to help us achieve our goal. Looking forward to many more collaboration!",
    image: recognitionImage(
      "srid-010424",
      "Thank you for excellent work on Restore feature",
      1600,
      1167,
    ),
    tags: ["Leadership"],
    category: "Leadership",
  },
  {
    id: "rohi-100324",
    title: "Thank you for excellent work on Backup & Restore feature",
    description:
      "Hi Umesh, Thanks for your excellent contribution towards the Unified Backup Restore feature for Congo. You dived deep into it even without being asked and became a major contributor. I appreciate all the hard work, sincerity. Please keep up the good work",
    image: recognitionImage(
      "rohi-100324",
      "Thank you for excellent work on Backup & Restore feature",
      1600,
      1160,
    ),
    tags: ["Leadership"],
    category: "Leadership",
  },
  {
    id: "maru-181023",
    title: "Team Player",
    description:
      "Starting from the release till now, any queries I had related to all the issues, I have contacted you to get more clarification on the issue, you are always been there for me anytime I pinged you on webex, joined quick webex call and clarified all the queries with great support. This is a small token of appreciation from me. Keep up the good work, thanks for everything, Umesh !",
    image: recognitionImage("maru-181023", "Team Player", 1600, 1159),
    tags: ["Team Player"],
    category: "Mentorship",
  },
  {
    id: "moulie-120723",
    title: "Internal Tools Development",
    description:
      "You have all made a great contribution in the last 2 quarters on multiple different activities that has enriched the team in many ways. While all of you have been actively mentoring the EICs in the team, some of you have also contributed actively for the RAM tool and Kollect/CURI tool. Thanks for all the support you have given so far and let's come together further and achieve greater results!",
    image: recognitionImage("moulie-120723", "Internal Tools Development", 1600, 1159),
    tags: ["Leadership, Mentorship, Team Player"],
    category: "Mentorship",
  },
  {
    id: "ara-290923",
    title: "Root Cause Analysis and Release",
    description:
      "Hi Umesh Thank you so much for root causing last minute EFT vzAny PBR issues and trying multiple issues in parallel. It really helped to expedite process and close it sooner. Thanks",
    image: recognitionImage("ara-290923", "Root Cause Analysis and Release", 1600, 1156),
    tags: ["Leadership"],
    category: "Leadership",
    highlightOrder: 6,
  },
  {
    id: "rohi-270923",
    title: "Development test and RCA",
    description:
      "Hi Umesh, Thank you so much for your hard work on all the areas in NDO be it ES, Schema. You always go the extra mile to make sure all the corner cases are covered. Your sincerity, dedication and proactiveness is commendable. You have slowly become the go-to person of all the team members. Please keep up the good work.",
    image: recognitionImage("rohi-270923", "Development test and RCA", 1600, 1162),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "mou-120723",
    title: "Driving ESG IT",
    description:
      "You have all made a great contribution in the last 2 quarters on multiple different activities that has enriched the team in many ways. While all of you have been actively mentoring the EICs in the team, some of you have also contributed actively for the RAM tool and Kollect/CURI tool. Thanks for all the support you have given so far and let's come together further and achieve greater results!",
    image: recognitionImage("mou-120723", "Driving ESG IT", 1600, 1159),
    tags: ["Innovation"],
    category: "Innovation",
  },
  {
    id: "pal-050723",
    title: "Congratulations on winning 2023 Asia-Pacific Stevie Bronze award",
    description:
      "Congratulations for winning 2023 Asia-Pacific Stevie Bronze award for Resource Allocation Manager-Simplifying Resource Allocation and Management with end-to-end(E2E) Automated Dashboard. Thank you for raising the benchmark of automation & innovation excellence. Continue to shine with the incredible work! Best Pallavi",
    image: recognitionImage(
      "pal-050723",
      "Congratulations on winning 2023 Asia-Pacific Stevie Bronze award",
      1600,
      1162,
    ),
    tags: ["Innovation", "Ownership"],
    category: "Innovation",
    highlightOrder: 1,
  },
  {
    id: "ara-020723",
    title: "Onboarding and ramping up with different codebases",
    description:
      "Hi Umesh Thank you so much for taking extra step in debugging issues and analysing them. You quickly ramped up in service graph area and you are taking care of bugs by yourself . Your contribution really helped to make faster progress in vzAny project Thanks once again -Aravind / Rohini",
    image: recognitionImage(
      "ara-020723",
      "Onboarding and ramping up with different codebases",
      1600,
      1156,
    ),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "rohi-030523",
    title: "Onboarding and ramping up with different codebases",
    description:
      "Hi Umesh, Thanks a lot for your diligence and hard work on the workflow validations. You ramped up very well on a difficult feature and proactively picked up items to work on and executed them independently. Thanks again. Please keep it up.",
    image: recognitionImage(
      "rohi-030523",
      "Onboarding and ramping up with different codebases",
      1600,
      1158,
    ),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "pra-080323",
    title: "Training interns",
    description:
      "Thanks Team for taking the time from your work and busy schedule to pitch in for delivering CCNA training to over 200+ interns. This was a first for many reasons. The ~45 hours high quality 4K videos can now be re-used again for lateral hires and other EIG. Great to see the feedback on the training that had both theory and hands-on lab combined. This also is a scalable way of doing trainings.. Way to go",
    image: recognitionImage("pra-080323", "Training interns", 1600, 1159),
    tags: ["Mentorship", "Team Player"],
    category: "Mentorship",
    highlightOrder: 4,
  },
  {
    id: "rohi-240123",
    title: "Onboarding and ramping up",
    description:
      "Hi Umesh, Thanks so much for ramping up soon and already being productive. I am already counting on you to help us with the 411 Service Graph bugs. Rohini",
    image: recognitionImage("rohi-240123", "Onboarding and ramping up", 1600, 1163),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "ash-290922",
    title: "Innovation: Internal Tool",
    description:
      "Thanks Umesh and Arjun for your great contribution towards BAT (BOM Assist Tool). Your deep Code development and testing skills has given final shape to BAT tool which is consumable by CX DC Team and will helped create accurate BOM during ordering in future. Keep up your good work !",
    image: recognitionImage("ash-290922", "Innovation: Internal Tool", 1600, 1155),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "ana-230922",
    title: "Innovation: Internal Tool",
    description:
      "Dear Team, Thank you for the great support in helping us build the IDP demand form for APJC CXC. Your contribution and dedication in working with the operations team is greatly appreciated. It is always a pleasure to collaborate with professionals like you who help automate various tasks as part of the larger program or initiative. Wish you all the best for a great career in Cisco! Thanks Anand Iyer",
    image: recognitionImage("ana-230922", "Innovation: Internal Tool", 1600, 1153),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "pra-140622",
    title: "Innovation: Internal Tool",
    description:
      "Thank you for the work down towards Resource Allocation Manager (RAM) Tool. This will help solve a real business challenge and help provide insights on skills availability, demand and forecast on utilization. This will also integrate with Skills Heatmap initiative by sharing insights on the skills in demand.",
    image: recognitionImage("pra-140622", "Innovation: Internal Tool", 1600, 1163),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "mad-260522",
    title: "Innovation: Internal Tool",
    description:
      "Thank you for your relentless efforts in these 8 weeks working on DC Lab 2.0 build. Your effort in streamlining the lab top logies, revamping the physical connectivity, streamlining the booking process by building the lab portal, and playbook creation in networking and compute space is truly commendable. Keep up the good work! Looking forward to your continued support.",
    image: recognitionImage("mad-260522", "Innovation: Internal Tool", 1600, 1161),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "mad-230422",
    title: "Innovation: Internal Tool",
    description:
      "Umesh, Ever since you joined our team as an ET, your contribution to our team and customers has been phenomenal. Truly appreciate the efforts you put in towards team-building initiatives. Your effort in automating the 13-week forecast view as a part of the demand planning initiative is commendable. The positive work attitude you have inspires the team. Thank you for everything that you do for our team and our customers. Keep up the brilliant spirit!.",
    image: recognitionImage("mad-230422", "Innovation: Internal Tool", 1600, 1157),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
  },
  {
    id: "yogi-070422",
    title: "Innovation: Internal Tool",
    description:
      "Thank you so much for your contributions to Codeshift till date, with your invaluable efforts we have been able to take it from an Idea to a functional platform in very short time!",
    image: recognitionImage("yogi-070422", "Innovation: Internal Tool", 1600, 1159),
    tags: ["Innovation", "Team Player"],
    category: "Innovation",
    highlightOrder: 2,
  },
] as const satisfies readonly Recognition[];

export type RecognitionId = (typeof recognitions)[number]["id"];
