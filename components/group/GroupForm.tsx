"use client";

import GroupActions from "@/actions/GroupActions";
import AuthorActions from "@/actions/AuthorActions";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import { Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import { toast } from "react-toastify";
import RichTextToolbar from "../blog/RichTextToolbar";

export type GroupFormData = {
    name: string;
    description?: string;
    image?: string;
    members?: number[];
};

export type GroupInitialData = {
    id?: number;
    name: string;
    description?: string;
    image?: string;
    members?: number[];
    created_by?: number;
};

type GroupFormProps = {
    mode: "create" | "update";
    initialData?: GroupInitialData | null;
};

type GroupAuthor = {
    id: number;
    name?: string;
    email?: string;
};

const BACKEND_DOMAIN = 'https://api-admin.ethnicinfotech.in';

const inputClassName =
    "w-full rounded-[18px] border border-white/8 bg-[#101826] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#31425e] focus:outline-none";

const labelClassName =
    "text-[11px] font-medium uppercase tracking-[0.22em] text-[#7f90a8]";

const GroupForm = ({ mode, initialData }: GroupFormProps) => {
    const router = useRouter();
    const [openMediaModal, setOpenMediaModal] = useState(false);
    const [authors, setAuthors] = useState<GroupAuthor[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const formId = mode === "create" ? "group-create-form" : "group-update-form";
    const isUpdate = mode === "update";

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useForm<GroupFormData>({
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            image: initialData?.image || "",
            members: initialData?.members || [],
        },
    });

    const previewImage = useWatch({ control, name: "image" });
    const description = useWatch({ control, name: "description" });
    const selectedMembers = useWatch({ control, name: "members" }) || [];
    const creatorId = Number(initialData?.created_by || currentUserId || 0);
    const availableAuthors = creatorId
        ? authors.filter((author) => Number(author.id) !== creatorId)
        : authors;
    const sanitizedSelectedMembers = creatorId
        ? selectedMembers.filter((id) => Number(id) !== creatorId)
        : selectedMembers;

    const selectedMemberDetails = availableAuthors.filter((author) =>
        sanitizedSelectedMembers.map(Number).includes(Number(author.id))
    );

    const handleMemberToggle = (memberId: number) => {
        if (creatorId && Number(memberId) === creatorId) {
            return;
        }

        const updatedMembers = sanitizedSelectedMembers.includes(memberId)
            ? sanitizedSelectedMembers.filter((id) => id !== memberId)
            : [...sanitizedSelectedMembers, memberId];

        setValue("members", updatedMembers, {
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    useEffect(() => {
        const loadAuthors = async () => {
            try {
                const res = await AuthorActions.getAllAuthors();
                setAuthors(res?.data || res || []);
            } catch (err) {
                console.error(err);
            }
        };

        loadAuthors();
        const timeout = window.setTimeout(() => {
            const currentUser = AuthorActions.getCurrentUserRole();
            setCurrentUserId(currentUser?.id ? Number(currentUser.id) : null);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, []);

    useEffect(() => {
        reset({
            name: initialData?.name || "",
            description: initialData?.description || "",
            image: initialData?.image || "",
            members: creatorId
                ? (initialData?.members || []).filter((id) => Number(id) !== creatorId)
                : initialData?.members || [],
        });
    }, [creatorId, initialData, reset]);

    const onSubmit = async (data: GroupFormData) => {
        const payload = {
            ...data,
            members: (data.members || [])
                .map((id) => Number(id))
                .filter((id) => !creatorId || id !== creatorId),
        };

        try {
            const response = isUpdate && initialData?.id
                ? await GroupActions.updateGroup(initialData.id, payload)
                : await GroupActions.addGroup(payload);

            if (response?.success) {
                toast.success(response.message || "Saved successfully");
                router.push("/account/groups");
                return;
            }

            toast.error(response?.message || "Something went wrong");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to save");
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="rounded-[24px] border border-white/8 bg-[#151d2c]/95 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300">
                    <div className="flex flex-col gap-4 transition-all duration-300 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
                        <div className="min-w-0">
                            <span className="inline-flex items-center rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8ea0b8] transition-all duration-300 opacity-100">
                                Group Management
                            </span>

                            <h1 className="mt-4 text-[36px] font-semibold capitalize leading-none tracking-[-0.04em] text-[#eef4ff] transition-all duration-300">
                                {isUpdate ? "Update Group" : "Create New Group"}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8ea0b8] transition-all duration-300 opacity-100">
                                {isUpdate
                                    ? "Update group details and membership."
                                    : "Create a new team/group and add members to it."}
                            </p>
                        </div>

                        <button
                            type="submit"
                            form={formId}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eef4ff] px-5 py-3 text-sm font-semibold text-[#0f1724] transition hover:bg-white"
                        >
                            <Save size={18} /> {isUpdate ? "Update" : "Submit"}
                        </button>
                    </div>
                </div>

                <form
                    id={formId}
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <div className="col-span-2 rounded-[24px] border border-white/8 bg-[#151d2c] p-6">
                        <div className="border-b border-white/8 pb-4">
                            <h3 className="text-lg font-semibold text-[#eef4ff]">Group Details</h3>

                            <p className="mt-1 text-sm text-[#8ea0b8]">
                                {isUpdate
                                    ? "Edit this group's information and members."
                                    : "Fill in the required information to create a new group."}
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label htmlFor="group-name" className={labelClassName}>Name</label>

                                <input
                                    id="group-name"
                                    type="text"
                                    className={inputClassName}
                                    placeholder="Enter group name"
                                    {...register("name", { required: "Name is required" })}
                                />

                                {errors.name && (
                                    <p className="text-xs text-red-400">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <label className={labelClassName}>Members</label>

                                        <p className="mt-1 text-sm text-[#8ea0b8]">
                                            Select one or more members for this group.
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-white/8 bg-[#101826] px-3 py-1 text-xs text-[#8ea0b8]">
                                        {sanitizedSelectedMembers.length} selected
                                    </span>
                                </div>

                                <div className="rounded-[20px] border border-white/8 bg-[#101826] p-4">
                                    {selectedMemberDetails.length > 0 && (
                                        <div>
                                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                                Selected Members
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedMemberDetails.map((member) => (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => handleMemberToggle(member.id)}
                                                        className="rounded-full border border-[#3f7b83] bg-[#16333a] px-3 py-1.5 text-sm font-medium text-[#c2edf0] transition hover:border-[#62aab3] hover:bg-[#1b4048]"
                                                    >
                                                        {member.name || member.email} ×
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className={selectedMemberDetails.length > 0 ? "mt-4" : ""}>
                                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#7f90a8]">
                                            All Members
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            {availableAuthors.map((member) => {
                                                const isSelected = sanitizedSelectedMembers.map(Number).includes(Number(member.id));

                                                return (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => handleMemberToggle(member.id)}
                                                        aria-pressed={isSelected}
                                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isSelected
                                                            ? "border-[#3f7b83] bg-[#16333a] text-[#c2edf0]"
                                                            : "border-white/10 bg-[#151d2c] text-[#dbe5f3] hover:border-[#31425e] hover:bg-[#182438]"
                                                            }`}
                                                    >
                                                        {member.name || member.email}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className={labelClassName}>Description</p>
                                    <p className="text-xs text-[#6f8096]">Rich text editor</p>
                                </div>

                                <div className="blog-editor overflow-hidden rounded-[22px] border border-white/8 bg-[#101826] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                    <EditorProvider>
                                        <RichTextToolbar platformData={null} content={description || ""} />
                                        <Editor
                                            value={description || ""}
                                            onChange={(e) =>
                                                setValue("description", e.target.value, {
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                })
                                            }
                                            containerProps={{
                                                className: "min-h-[200px] border-0 bg-[#0f1724] shadow-none",
                                            }}
                                            className="min-h-[200px] bg-[#0f1724] px-4 py-4 text-sm leading-7 text-[#dbe5f3] focus:outline-none"
                                            placeholder="Write group description here..."
                                        />
                                    </EditorProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 h-fit w-full rounded-[24px] border border-white/8 bg-[#151d2c] p-6 lg:col-span-1">
                        <div className="border-b border-white/8 pb-4">
                            <h3 className="text-lg font-semibold text-[#eef4ff]">Group Image</h3>

                            <p className="mt-1 text-sm text-[#8ea0b8]">Optional image for the group.</p>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setOpenMediaModal(true)}
                                className="group flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#101826] px-6 py-10 transition hover:border-[#31425e]"
                            >
                                {previewImage ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10">
                                            <Image
                                                fill
                                                alt="Preview"
                                                className="object-cover"
                                                src={`${BACKEND_DOMAIN}/${previewImage}`}
                                            />
                                        </div>

                                        <p className="mt-4 text-sm text-[#8ea0b8]">Click to change image</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#151d2c]">
                                            <Save size={28} className="text-[#8ea0b8]" />
                                        </div>

                                        <p className="mt-4 text-sm font-medium text-[#eef4ff]">Select Group Image</p>

                                        <p className="mt-1 text-xs text-[#8ea0b8]">Choose image from media library</p>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <UploadMediaModal
                isOpen={openMediaModal}
                onClose={() => setOpenMediaModal(false)}
                allowedMediaType="image"
                onSelectImage={(url) => {
                    setValue("image", url);
                }}
            />
        </>
    );
};

export default GroupForm;
