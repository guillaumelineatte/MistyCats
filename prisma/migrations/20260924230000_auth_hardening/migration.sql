-- Phase 2 : durcissement auth. Le reset de mot de passe et la vérification
-- d'email passent désormais par VerificationToken (créée en phase 1, hashée,
-- à usage unique) au lieu du champ User.resetToken en clair.
ALTER TABLE "User" DROP COLUMN "resetToken";
ALTER TABLE "User" DROP COLUMN "resetTokenExpiry";
