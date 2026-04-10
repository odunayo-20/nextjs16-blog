"use client"

import { updateBlogAction } from '@/app/action'
import { postSchema } from '@/app/schemas/blog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Id } from '@/convex/_generated/dataModel'
import { api } from "@/convex/_generated/api" // ADD THIS
import { useMutation } from "convex/react" // ADD THIS
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { buttonVariants } from '../ui/button-variants'

interface EditRouteProps {
    initialData: {
        _id: Id<"posts">;
        title: string;
        content: string;
        imageUrl?: string;
    }
}

const EditRoute = ({ initialData }: EditRouteProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Create the mutation hook for the upload URL
    const generateUploadUrl = useMutation(api.posts.generateImageUploadUrl);

    const form = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: initialData.title,
            content: initialData.content,
        },
    });

    // async function onSubmit(values: z.infer<typeof postSchema>) {
    //     startTransition(async () => {
    //         try {
    //             let imageStorageId: string | undefined = undefined;

    //             // 1. If there's a new image, upload it directly from the client
    //             if (values.image && values.image instanceof File) {
    //                 toast.loading("Uploading image...", { id: "upload" });


    //                 // Get destination URL
    //                 const uploadUrl = await generateUploadUrl();

    //                 // Upload file to Convex Storage
    //                 const result = await fetch(uploadUrl, {
    //                     method: "POST",
    //                     headers: { "Content-Type": values.image.type },
    //                     body: values.image,
    //                 });

    //                 if (!result.ok) throw new Error("Failed to upload image to storage");

    //                 const { storageId } = await result.json();
    //                 imageStorageId = storageId;
    //                 toast.success("Image uploaded", { id: "upload" });
    //             }

    //             // 2. Pass only IDs and text to the Server Action
    //             // This stays UNDER the 5MB limit because the file is gone!
    //             const result = await updateBlogAction({ 
    //                 title: values.title,
    //                 content: values.content,
    //                 postId: initialData._id,
    //                 imageStorageId: imageStorageId // Pass the ID string, not the file
    //             });

    //             if (result && 'error' in result) {
    //                 toast.error(result.error);
    //                 return;
    //             }

    //             toast.success('Post updated successfully');
    //             router.push(`/blog/${initialData._id}`);
    //             router.refresh();
    //         } catch (error) {
    //             const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
    //             toast.error(errorMessage);
    //         }
    //     });
    // }


    async function onSubmit(values: z.infer<typeof postSchema>) {
        startTransition(async () => {
            try {
                let imageStorageId: string | undefined = undefined;

                // 1. If there's a new image, upload it
                if (values.image && values.image instanceof File) {
                    toast.loading("Uploading image...", { id: "upload" });

                    const uploadUrl = await generateUploadUrl();
                    const result = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": values.image.type },
                        body: values.image,
                    });

                    if (!result.ok) throw new Error("Failed to upload image");

                    const { storageId } = await result.json();
                    imageStorageId = storageId;
                    toast.success("Image uploaded", { id: "upload" });
                }

                // 2. Update the blog and handle old image deletion
                const result = await updateBlogAction({
                    title: values.title,
                    content: values.content,
                    postId: initialData._id,
                    imageStorageId: imageStorageId, // The new ID
                    // Pass the old ID so the Server Action knows what to delete
                    oldImageStorageId: imageStorageId ? initialData.imageStorageId : undefined
                });

                if (result && 'error' in result) {
                    toast.error(result.error);
                    return;
                }

                toast.success('Post updated successfully');
                router.push(`/blog/${initialData._id}`);
                router.refresh();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
                toast.error(errorMessage);
            }
        });
    }

    return (
        <div className='py-12'>
            <div className='text-center max-w-2xl mx-auto'>
                <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl'>Edit Post</h1>
                <p className='text-xl text-muted-foreground pt-4'>Refine your masterpiece</p>
            </div>

            <Card className='w-full max-w-xl mx-auto mt-8'>
                <CardHeader>
                    <CardTitle>Update Article</CardTitle>
                    <CardDescription>Changes will be reflected immediately</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {/* TITLE FIELD */}
                            <Controller name='title' control={form.control} render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Title</FieldLabel>
                                    <Input aria-invalid={fieldState.invalid} {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />

                            {/* CONTENT FIELD */}
                            <Controller name='content' control={form.control} render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Content</FieldLabel>
                                    <Textarea aria-invalid={fieldState.invalid} rows={8} {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />

                            {/* IMAGE FIELD (Optional) */}
                            <Controller name='image' control={form.control} render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Update Image (Optional)</FieldLabel>
                                    <Input
                                        type='file'
                                        accept='image/*'
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
                                </Field>
                            )} />

                            <div className="flex gap-4">
                                <Button type='submit' disabled={isPending} className="flex-1">
                                    {isPending ? (
                                        <>
                                            <Loader2 className='size-4 animate-spin mr-2' />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        "Save Updates"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    className={buttonVariants({ variant: "outline" })}
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditRoute;
