#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ROOT="$(cd .. && pwd)"
TOOLCHAIN="$ROOT/.android-toolchain"
JDK="$TOOLCHAIN/jdk-17.0.20+8/bin"
SDK="$TOOLCHAIN/sdk"
BUILD_TOOLS="$SDK/build-tools/34.0.0"
PLATFORM_JAR="$SDK/platforms/android-34/android.jar"

export JAVA_HOME="$(cygpath -w "$TOOLCHAIN/jdk-17.0.20+8")"
export PATH="$JDK:$PATH"

OUT="build"
rm -rf "$OUT"
mkdir -p "$OUT/compiled-res" "$OUT/gen" "$OUT/classes" "$OUT/dex"

echo "== aapt2 compile resources =="
"$BUILD_TOOLS/aapt2.exe" compile --dir res -o "$OUT/compiled-res"

echo "== aapt2 link (base apk + R.java) =="
"$BUILD_TOOLS/aapt2.exe" link \
  -o "$OUT/base.apk" \
  -I "$PLATFORM_JAR" \
  --manifest AndroidManifest.xml \
  --java "$OUT/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  "$OUT/compiled-res"/*.flat

echo "== javac =="
find src "$OUT/gen" -name "*.java" > "$OUT/sources.txt"
"$JDK/javac.exe" -source 8 -target 8 -bootclasspath "$PLATFORM_JAR" -cp "$PLATFORM_JAR" \
  -d "$OUT/classes" @"$OUT/sources.txt"

echo "== d8 (dex) =="
find "$OUT/classes" -name "*.class" > "$OUT/classfiles.txt"
"$BUILD_TOOLS/d8.bat" --output "$OUT/dex" --lib "$PLATFORM_JAR" @"$OUT/classfiles.txt"

echo "== assemble apk (inject classes.dex) =="
cp "$OUT/base.apk" "$OUT/billi-unsigned.apk"
(cd "$OUT/dex" && "$JDK/jar.exe" uf "../billi-unsigned.apk" classes.dex)

echo "== zipalign =="
"$BUILD_TOOLS/zipalign.exe" -f -p 4 "$OUT/billi-unsigned.apk" "$OUT/billi-aligned.apk"

echo "== debug keystore =="
KEYSTORE="$TOOLCHAIN/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  "$JDK/keytool.exe" -genkeypair -v -keystore "$KEYSTORE" -storepass android -alias billidebug \
    -keypass android -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Billi Debug,O=Billi,C=US"
fi

echo "== sign =="
"$BUILD_TOOLS/apksigner.bat" sign --ks "$KEYSTORE" --ks-pass pass:android --key-pass pass:android \
  --out "$OUT/billi.apk" "$OUT/billi-aligned.apk"

echo "== verify =="
"$BUILD_TOOLS/apksigner.bat" verify "$OUT/billi.apk" && echo "SIGNATURE OK"

echo ""
echo "Built: $(pwd)/$OUT/billi.apk"
ls -la "$OUT/billi.apk"
