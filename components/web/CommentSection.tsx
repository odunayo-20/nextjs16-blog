"use client"

import { Card, CardContent, CardHeader } from '../ui/card'
import { Loader2, MessageSquare } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentSchema } from '@/app/schemas/comment'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useParams } from 'next/navigation'
import { Id } from '@/convex/_generated/dataModel'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import z from 'zod'
import { useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Separator } from '../ui/separator'





const CommentSection = (props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) => {
  
  const [isPending, startTransition] = useTransition();
  
  const params = useParams<{ postId: Id<"posts"> }>();
  
  const data = usePreloadedQuery(props.preloadedComments);

  const createComment = useMutation(api.comments.createComment);

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
      postId: params.postId,
    }
  });

  async function onSubmit(data: z.infer<typeof commentSchema>){
   startTransition(async () => {
     try {
      console.log("mdmasmcd");
      await createComment(data);
      toast.success("Comment created successfully");
      form.reset();
    } catch (error) {
      toast.error("Failed to create comment");
    }
   })
  }

  if (data === undefined){
  return <p>loading...</p>
  }

  return (
    <Card>
        <CardHeader>
            <MessageSquare className='size-5' />
            <h2 className='text-xl font-bold'>{data.length} Comments</h2>
        </CardHeader>
        <CardContent className='space-y-8'>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
<Controller name='body' control={form.control}
render={({ field, fieldState}) => (
  <Field>
    <FieldLabel>Comment</FieldLabel>
    <Textarea aria-invalid={fieldState.invalid} placeholder='Share your thoughts' {...field} />
    {
      fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )
    }
  </Field>
)}
/>

<Button type='submit' disabled={isPending}>
  {
    isPending ? (
      <>
      <Loader2 className='size-4 animate-spin' />
      <span>Loading...</span>
      </>
    ) : (
      <span>Submit</span>
    )
  }
</Button>

            
          </form>

          {
            data?.length > 0 && <Separator/>
          }


          <section className='space-y-4 mt-8'>
            {
              data?.map((comment) => (
                <div key={comment._id} className='flex gap-4'>
                  <Avatar className="size-10 shrink-0">
<AvatarImage src={`https://ui-avatars.com/api/?name=${comment.authorName}&background=random&size=128`} alt={comment.authorName} />

<AvatarFallback>
  {comment.authorName?.slice(0, 2).toUpperCase()}
</AvatarFallback>
                    </Avatar>

                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center justify-between'>
                        <p className='font-semibold text-sm'>{comment.authorName}</p>
                        <p className='text-muted-foreground text-xs'>{new Date(comment._creationTime).toLocaleDateString("en-US")}</p>
                      </div>

<p className='text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed'>{comment.body}</p>


                    </div>
                </div>
              ))
            }
            </section>

        </CardContent>
    </Card>
  )
}

export default CommentSection