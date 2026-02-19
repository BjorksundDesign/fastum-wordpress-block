#!/bin/bash
# Release script - handles build, version sync, and git operations

set -e  # Exit on error

VERSION_TYPE="${1:-patch}"  # patch, minor, or major

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: ./release.sh [patch|minor|major]"
  exit 1
fi

echo "🔨 Building project..."
npm run build

echo "📦 Committing build assets..."
git add -A
git commit -m "Build assets" --allow-empty

echo "🔄 Bumping version ($VERSION_TYPE)..."
npm version "$VERSION_TYPE" --no-git-tag-version

echo "🔗 Syncing versions across files..."
node .sync-versions.js

echo "📝 Creating release commit..."
git add package.json custom-text-block.php readme.txt
git commit -m "Release: Bump version"

echo "🏷️  Creating git tag..."
PACKAGE_VERSION=$(grep '"version"' package.json | sed 's/.*"\([^"]*\)".*/\1/')
git tag "v$PACKAGE_VERSION"

echo "🚀 Pushing to GitHub..."
git push origin main
git push origin "v$PACKAGE_VERSION"

echo "✅ Release complete! Version $PACKAGE_VERSION released."
