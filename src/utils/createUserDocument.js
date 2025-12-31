import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Creates a Firestore user document for a new user on first login
 * If user document already exists, does nothing (prevents overwriting)
 * 
 * @param {Object} firebaseUser - Firebase Auth user object
 * @returns {Promise<boolean>} - Returns true if document was created, false if already exists
 */
export async function createUserDocument(firebaseUser) {
    if (!firebaseUser) {
        console.warn("createUserDocument: No user provided");
        return false;
    }

    try {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);

        // Check if document already exists
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // User document already exists, don't overwrite
            console.log("User document already exists for:", firebaseUser.uid);
            return false;
        }

        // Create new user document
        const userData = {
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: "",
            address: "",
            city: "",
            profileImage: "",
            role: "customer",
            createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userData);
        console.log("User document created successfully for:", firebaseUser.uid);
        return true;

    } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
    }
}

/**
 * Fetches user profile data from Firestore
 * 
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} - User profile data or null if not found
 */
export async function getUserProfile(uid) {
    if (!uid) return null;

    try {
        const userDocRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

/**
 * Updates user profile data in Firestore
 * 
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data to update (phone, address, city, profileImage, name)
 * @returns {Promise<boolean>} - Returns true if successful
 */
export async function updateUserProfile(uid, profileData) {
    if (!uid) return false;

    try {
        const userDocRef = doc(firestore, "users", uid);

        // Only update specific fields to prevent overwriting other data
        const updateData = {};
        if (profileData.phone !== undefined) updateData.phone = profileData.phone;
        if (profileData.address !== undefined) updateData.address = profileData.address;
        if (profileData.city !== undefined) updateData.city = profileData.city;
        if (profileData.profileImage !== undefined) updateData.profileImage = profileData.profileImage;
        if (profileData.name !== undefined) updateData.name = profileData.name;

        await setDoc(userDocRef, updateData, { merge: true });
        console.log("User profile updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}
