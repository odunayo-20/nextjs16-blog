"use client"

import { createBlogAction } from '@/app/action'
import { postSchema } from '@/app/schemas/blog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { startTransition, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

const CreateRoute = () => {

    const [ isPending, startTransition ] = useTransition();

    const router = useRouter();

    const mutation = useMutation(api.posts.createPost);
    const form = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });


    function onSubmit(values: z.infer<typeof postSchema>) {

      startTransition(async () => {
        //   const result = mutation({
        //     body: values.content,
        //     title: values.title,

    // });
    await createBlogAction(values); 

        toast.success('Post created successfully');
        
        
        router.push('/')
      })

    }


  return (
    <div className='py-12'>
<div className='text-center max-w-2xl mx-auto'>
    <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl'>Create Post</h1>
    <p className='text-xl text-muted-foreground pt-4'>Create your own blog article</p>
</div>


<Card className='w-full max-w-xl mx-auto'>
    <CardHeader>
        <CardTitle>Create Blog Article</CardTitle>
        <CardDescription>Create a new blog article</CardDescription>
    </CardHeader>

    <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller name='title' control={form.control} render={({ field, fieldState }) => (
                   <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input aria-invalid={fieldState.invalid} placeholder='super cool title' {...field} />
                   {
                    fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}></FieldError>
                    )
                   }
                   </Field>
                )} />
                <Controller name='content' control={form.control} render={({ field, fieldState }) => (
                   <Field>
                    <FieldLabel>Content</FieldLabel>
                    <Textarea aria-invalid={fieldState.invalid} placeholder='super cool content' {...field} />
                   {
                    fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}></FieldError>
                    )
                   }
                   </Field>
                )} />

                <Controller name='image' control={form.control} render={({ field, fieldState }) => (
                   <Field>
                    <FieldLabel>Image</FieldLabel>
                    <Input type='file' 
                        accept='image/*'
                        aria-invalid={fieldState.invalid} 
                        placeholder='Upload an image' 
                        onChange={(event) => {
                            const file = event?.target.files?.[0];
                            field.onChange(file);
                        }} 
                    />
                   {
                    fieldState.invalid && (
                        <FieldError errors={[fieldState.error]}></FieldError>
                    )
                   }
                   </Field>
                )} />

                <Button type='submit' disabled={isPending}>
                    {
                        isPending ? (
                           <>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Creating...</span>
                           </>
                        ) : (
                           <span>Create Post</span>
                        )
                    }
                </Button>
            </FieldGroup>
        </form>
    </CardContent>
</Card>
    </div>
  )
}

export default CreateRoute