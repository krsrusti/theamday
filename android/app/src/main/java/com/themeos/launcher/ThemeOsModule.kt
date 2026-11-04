package com.themeos.launcher

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject

/** Every method resolves a JSON string: {"ok":true,"data":...} or {"ok":false,"error":{code,message}} */
class ThemeOsModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

    override fun getName() = "ThemeOS"

    private fun respond(promise: Promise, block: () -> Any?) {
        val out = JSONObject()
        try {
            out.put("ok", true).put("data", block() ?: JSONObject.NULL)
        } catch (e: ThemeError) {
            out.put("ok", false).put("error", JSONObject().put("code", e.code).put("message", e.message))
        } catch (e: Exception) {
            out.put("ok", false).put("error", JSONObject().put("code", "NATIVE_ERROR").put("message", e.message ?: "unknown"))
        }
        promise.resolve(out.toString())
    }

    @ReactMethod
    fun ping(promise: Promise) = respond(promise) { "pong from Kotlin" }

    @ReactMethod
    fun getLauncherStatus(promise: Promise) = respond(promise) {
        val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
        val resolved = ctx.packageManager.resolveActivity(home, android.content.pm.PackageManager.MATCH_DEFAULT_ONLY)
        JSONObject()
            .put("isDefaultHome", resolved?.activityInfo?.packageName == ctx.packageName)
            .put("currentHomePackage", resolved?.activityInfo?.packageName ?: JSONObject.NULL)
            .put("sdkInt", android.os.Build.VERSION.SDK_INT)
    }

    @ReactMethod
    fun getInstalledApplications(promise: Promise) = respond(promise) {
        val arr = JSONArray()
        InstalledAppsRepository.load(ctx).forEach {
            arr.put(JSONObject().put("label", it.label).put("packageName", it.packageName))
        }
        arr
    }

    @ReactMethod
    fun getInstalledThemes(promise: Promise) = respond(promise) { ThemeRepository.listThemes(ctx) }

    @ReactMethod
    fun getActiveTheme(promise: Promise) = respond(promise) { ThemeRepository.getActive(ctx) }

    @ReactMethod
    fun applyTheme(themeId: String, promise: Promise) = respond(promise) {
        ThemeRepository.apply(ctx, themeId)
    }

    @ReactMethod
    fun openDefaultLauncherSettings(promise: Promise) = respond(promise) {
        val intent = Intent(Settings.ACTION_HOME_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            ctx.startActivity(intent)
        } catch (e: Exception) {
            ctx.startActivity(Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        }
        true
    }
}
