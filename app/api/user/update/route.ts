import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const updateNotificationsSchema = z.object({
  usageAlerts: z.boolean().optional(),
  billingAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "profile": {
        const validatedData = updateProfileSchema.parse(data);

        // Check if email is being changed and if it's already taken
        if (validatedData.email && validatedData.email !== user.email) {
          const existingUser = await db.user.findUnique({
            where: { email: validatedData.email },
          });

          if (existingUser) {
            return NextResponse.json(
              { error: "Email already in use" },
              { status: 400 }
            );
          }
        }

        const updateData: any = {};
        if (validatedData.name !== undefined) {
          updateData.name = validatedData.name;
        }
        if (validatedData.email !== undefined) {
          updateData.email = validatedData.email;
          updateData.emailVerified = null; // Reset email verification when email changes
        }

        const updatedUser = await db.user.update({
          where: { id: user.id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
          },
        });

        return NextResponse.json({
          success: true,
          user: updatedUser,
        });
      }

      case "password": {
        const validatedData = updatePasswordSchema.parse(data);

        // Get current user with password
        const currentUser = await db.user.findUnique({
          where: { id: user.id },
          select: { password: true },
        });

        if (!currentUser || !currentUser.password) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
          validatedData.currentPassword,
          currentUser.password
        );

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

        // Update password
        await db.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        return NextResponse.json({
          success: true,
          message: "Password updated successfully",
        });
      }

      case "notifications": {
        const validatedData = updateNotificationsSchema.parse(data);

        // For now, we'll store notification preferences in a JSON field
        // In a real app, you might want a separate NotificationPreferences model
        const preferences = {
          usageAlerts: validatedData.usageAlerts ?? true,
          billingAlerts: validatedData.billingAlerts ?? true,
          marketingEmails: validatedData.marketingEmails ?? false,
        };

        // Update user (you might want to add a preferences field to User model)
        // For now, we'll just return success
        // In production, add: data: { preferences: JSON.stringify(preferences) }

        return NextResponse.json({
          success: true,
          preferences,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid update type" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete account" },
        { status: 400 }
      );
    }

    // Verify password
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!currentUser || !currentUser.password) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

